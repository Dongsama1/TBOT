const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
// 진단 데이터 경로: 환경 변수 또는 기본값 (프로젝트 내부 diagnostics 폴더)
const DIAGNOSTICS_PATH = process.env.DIAGNOSTICS_PATH || path.join(__dirname, 'diagnostics');
const DB_PATH = path.join(__dirname, 'chatbot_logs.db');

// SQLite 데이터베이스 초기화
let db;
let totalCount = 0; // 누적 카운트

function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('데이터베이스 연결 오류:', err);
        reject(err);
        return;
      }
      console.log('SQLite 데이터베이스에 연결되었습니다.');
      
      // 질문 로그 테이블 생성
      db.run(`CREATE TABLE IF NOT EXISTS question_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        count INTEGER NOT NULL
      )`, (err) => {
        if (err) {
          console.error('테이블 생성 오류:', err);
          reject(err);
          return;
        }
        
        // 최종 누적 카운트 가져오기
        db.get('SELECT MAX(count) as maxCount FROM question_logs', (err, row) => {
          if (err) {
            console.error('카운트 조회 오류:', err);
            totalCount = 0;
          } else {
            totalCount = row && row.maxCount ? row.maxCount : 0;
            console.log(`최종 누적 카운트: ${totalCount}`);
          }
          resolve();
        });
      });
    });
  });
}

// 질문 로그 저장
function saveQuestionLog(question) {
  return new Promise((resolve, reject) => {
    totalCount++;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    db.run(
      'INSERT INTO question_logs (question, created_at, count) VALUES (?, ?, ?)',
      [question, now, totalCount],
      function(err) {
        if (err) {
          console.error('질문 로그 저장 오류:', err);
          reject(err);
        } else {
          console.log(`질문 로그 저장됨 (ID: ${this.lastID}, 카운트: ${totalCount})`);
          resolve({ id: this.lastID, count: totalCount });
        }
      }
    );
  });
}

// 질문 로그 검색
function searchQuestionLogs(date, time, question) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM question_logs WHERE 1=1';
    const params = [];
    
    if (date) {
      query += ' AND DATE(created_at) = ?';
      params.push(date);
    }
    
    if (time) {
      query += ' AND TIME(created_at) LIKE ?';
      params.push(time + '%');
    }
    
    if (question) {
      query += ' AND question LIKE ?';
      params.push('%' + question + '%');
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('질문 로그 검색 오류:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // 현재 디렉토리의 정적 파일 서빙

// 진단 데이터를 메모리에 로드
let diagnosticsData = [];

// 파일에서 텍스트 읽기 (인코딩 처리)
async function readFileWithEncoding(filePath) {
  try {
    // 여러 인코딩 시도
    const encodings = ['utf8', 'utf-8', 'euc-kr', 'cp949'];
    for (const encoding of encodings) {
      try {
        const content = await fs.readFile(filePath, encoding);
        return { content, encoding };
      } catch (e) {
        continue;
      }
    }
    // 기본 UTF-8로 읽기
    return { content: await fs.readFile(filePath, 'utf8'), encoding: 'utf8' };
  } catch (error) {
    console.error(`파일 읽기 오류: ${filePath}`, error);
    return { content: '', encoding: 'utf8' };
  }
}

// 진단 데이터 로드
async function loadDiagnosticsData() {
  try {
    // 디렉토리 존재 확인
    const dirExists = await fs.pathExists(DIAGNOSTICS_PATH);
    if (!dirExists) {
      console.warn(`진단 데이터 경로가 존재하지 않습니다: ${DIAGNOSTICS_PATH}`);
      console.warn('진단 데이터 폴더를 생성합니다...');
      await fs.ensureDir(DIAGNOSTICS_PATH);
      console.log('진단 데이터 폴더가 생성되었습니다. .txt 파일을 추가해주세요.');
      diagnosticsData = [];
      return;
    }
    
    const files = await fs.readdir(DIAGNOSTICS_PATH);
    diagnosticsData = [];
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const filePath = path.join(DIAGNOSTICS_PATH, file);
        const { content } = await readFileWithEncoding(filePath);
        
        if (content.trim()) {
          diagnosticsData.push({
            filename: file,
            content: content.trim(),
            keywords: extractKeywords(file, content)
          });
        }
      }
    }
    
    console.log(`총 ${diagnosticsData.length}개의 진단 파일을 로드했습니다.`);
  } catch (error) {
    console.error('진단 데이터 로드 오류:', error);
    diagnosticsData = [];
  }
}

// 키워드 추출 (파일명과 내용에서)
function extractKeywords(filename, content) {
  const keywords = [];
  
  // 파일명에서 모델명과 문제 추출
  const modelMatch = filename.match(/TYM_([A-Z0-9]+)/);
  if (modelMatch) keywords.push(modelMatch[1]);
  
  // 파일명에서 주요 키워드 추출
  const filenameKeywords = filename
    .replace(/TYM_[A-Z0-9]+_/g, '')
    .replace(/\.txt/g, '')
    .split(/[\s_]+/)
    .filter(k => k.length > 1);
  keywords.push(...filenameKeywords);
  
  // 내용에서 주요 단어 추출 (한글 단어)
  const contentWords = content.match(/[가-힣]{2,}/g) || [];
  const frequentWords = getFrequentWords(contentWords, 3);
  keywords.push(...frequentWords);
  
  return [...new Set(keywords)]; // 중복 제거
}

// 빈도가 높은 단어 추출
function getFrequentWords(words, minLength = 2) {
  const wordCount = {};
  words.forEach(word => {
    if (word.length >= minLength) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// 유사도 계산 (간단한 키워드 매칭)
function calculateRelevance(query, data) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  let score = 0;
  
  // 파일명 매칭
  const filenameLower = data.filename.toLowerCase();
  queryWords.forEach(word => {
    if (filenameLower.includes(word)) {
      score += 3;
    }
  });
  
  // 키워드 매칭
  data.keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    queryWords.forEach(word => {
      if (keywordLower.includes(word) || word.includes(keywordLower)) {
        score += 2;
      }
    });
  });
  
  // 내용 매칭
  const contentLower = data.content.toLowerCase();
  queryWords.forEach(word => {
    if (contentLower.includes(word)) {
      score += 1;
    }
  });
  
  return score;
}

// 파일명에서 직접 매칭 확인
function findExactFilenameMatch(query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
  
  // 파일명에서 정확히 매칭되는 문서 찾기
  for (const data of diagnosticsData) {
    const filenameLower = data.filename.toLowerCase().replace('.txt', '');
    
    // 쿼리의 모든 단어가 파일명에 포함되어 있는지 확인
    const allWordsMatch = queryWords.every(word => filenameLower.includes(word));
    
    if (allWordsMatch && queryWords.length > 0) {
      return data;
    }
  }
  
  return null;
}

// RAG 검색: 관련 문서 찾기
function searchRelevantDocuments(query, limit = 5) {
  // 먼저 파일명에서 직접 매칭 확인
  const exactMatch = findExactFilenameMatch(query);
  if (exactMatch) {
    return [exactMatch]; // 파일명 매칭이 있으면 해당 파일만 반환
  }
  
  // 파일명 매칭이 없으면 기존 방식으로 검색
  const scored = diagnosticsData.map(data => ({
    ...data,
    score: calculateRelevance(query, data)
  }));
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// 자연스러운 문장 형식으로 답변 생성 (무조건 문장 형식)
function generateNaturalResponse(content, query) {
  // 내용 정리: 줄바꿈, 불필요한 공백 제거
  let cleanContent = content
    .replace(/\n+/g, ' ')  // 줄바꿈을 공백으로
    .replace(/\s+/g, ' ')  // 여러 공백을 하나로
    .trim();
  
  // 리스트 형식(번호, 불릿)을 문장으로 변환
  cleanContent = cleanContent
    .replace(/\d+[\.\)]\s*/g, '')  // 번호 제거 (1. 2) 등)
    .replace(/[•·▪▫]\s*/g, '')  // 불릿 제거
    .replace(/[-]\s+/g, '')  // 하이픈 제거
    .replace(/\s+/g, ' ');  // 공백 정리
  
  // 문장 단위로 분리
  let sentences = cleanContent
    .split(/[.!?。！？]\s*/)  // 문장 끝 구분자로 분리
    .map(s => s.trim())
    .filter(s => s.length > 5);  // 너무 짧은 문장 제외
  
  // 문장이 없으면 내용을 문장으로 변환
  if (sentences.length === 0) {
    // 내용을 쉼표나 줄바꿈으로 분리하여 문장 만들기
    const parts = cleanContent.split(/[,，]\s*/).filter(p => p.trim().length > 5);
    if (parts.length > 0) {
      sentences = parts.map(p => p.trim() + '.');
    } else {
      // 마지막 수단: 전체 내용을 하나의 문장으로
      sentences = [cleanContent];
    }
  }
  
  // 쿼리 단어 추출
  const queryWords = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 1);
  
  // 관련 문장 찾기 (쿼리 단어가 포함된 문장)
  let relevantSentences = [];
  if (queryWords.length > 0) {
    relevantSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return queryWords.some(word => sentenceLower.includes(word));
    });
  }
  
  // 관련 문장이 있으면 사용, 없으면 처음 몇 개 문장 사용
  let selectedSentences = relevantSentences.length > 0
    ? relevantSentences.slice(0, 6)  // 최대 6개 문장
    : sentences.slice(0, 6);
  
  // 문장이 없으면 전체 내용 사용
  if (selectedSentences.length === 0) {
    selectedSentences = [cleanContent];
  }
  
  // 자연스러운 문장으로 조합
  let answer = selectedSentences
    .map(s => {
      s = s.trim();
      // 문장 끝에 마침표가 없으면 추가
      if (s && !s.endsWith('.') && !s.endsWith('!') && !s.endsWith('?')) {
        s += '.';
      }
      return s;
    })
    .filter(s => s.length > 0)
    .join(' ');
  
  // 너무 길면 자르기 (최대 1000자)
  if (answer.length > 1000) {
    const lastPeriod = answer.lastIndexOf('.', 1000);
    if (lastPeriod > 100) {  // 최소 100자 이상은 보장
      answer = answer.substring(0, lastPeriod + 1);
    } else {
      answer = answer.substring(0, 1000) + '...';
    }
  }
  
  // 답변이 비어있거나 너무 짧으면 전체 내용 사용
  if (!answer || answer.trim().length < 20) {
    answer = cleanContent.substring(0, 1000);
    if (cleanContent.length > 1000) {
      answer += '...';
    }
    // 마지막에 마침표 추가
    if (!answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
      answer += '.';
    }
  }
  
  // 최종 답변이 문장 형식인지 확인
  answer = answer.trim();
  
  // 문장이 제대로 끝나지 않았으면 마침표 추가
  if (answer && !answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
    answer += '.';
  }
  
  return answer;
}

// LLM 스타일 응답 생성 (무조건 문장 형식)
function generateResponse(query, relevantDocs) {
  if (relevantDocs.length === 0) {
    return {
      answer: "죄송합니다. 질문하신 내용에 대한 진단 정보를 찾을 수 없습니다. 다른 키워드로 질문해 주시거나, 모델명이나 증상을 구체적으로 알려주시면 도움을 드릴 수 있습니다.",
      sources: []
    };
  }
  
  // 모든 경우에 자연스러운 문장 형식으로 답변 생성
  const topDoc = relevantDocs[0];
  const isFilenameMatch = relevantDocs.length === 1 && findExactFilenameMatch(query);
  
  // 파일명 매칭이 있으면 해당 파일만 사용, 없으면 가장 관련성 높은 문서 사용
  let answer = generateNaturalResponse(topDoc.content, query);
  
  // 답변이 제대로 생성되었는지 확인
  if (!answer || answer.trim().length < 10) {
    // 답변이 너무 짧으면 기본 메시지
    answer = "제공된 문서에서 관련 정보를 찾았지만, 구체적인 내용을 추출하는데 어려움이 있습니다. 다른 키워드로 질문해 주시거나 더 구체적으로 질문해 주세요.";
  }
  
  return {
    answer: answer.trim(),
    sources: [topDoc.filename]
  };
}

// 내용 포맷팅 (질문과 관련된 부분만 추출)
function formatContent(content, query, isSummary = false) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const lines = content.split('\n').filter(line => line.trim());
  
  // 관련 문장 찾기
  const relevantLines = lines.filter(line => {
    const lineLower = line.toLowerCase();
    return queryWords.some(word => lineLower.includes(word));
  });
  
  if (relevantLines.length > 0 && !isSummary) {
    // 관련 문장들을 중심으로 앞뒤 문맥 포함
    const result = [];
    relevantLines.slice(0, 5).forEach(line => {
      result.push(line.trim());
    });
    return result.join('\n');
  } else if (isSummary) {
    // 요약: 처음 2-3줄만
    return lines.slice(0, 3).join('\n').substring(0, 150) + '...';
  } else {
    // 관련 문장이 없으면 전체 내용 (최대 500자)
    return content.substring(0, 500) + (content.length > 500 ? '...' : '');
  }
}

// API 엔드포인트: 채팅
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }
    
    // 질문 로그 저장
    const logResult = await saveQuestionLog(message);
    
    // 관련 문서 검색
    const relevantDocs = searchRelevantDocuments(message);
    
    // 응답 생성
    const response = generateResponse(message, relevantDocs);
    
    // 누적 카운트 포함하여 응답
    res.json({
      ...response,
      totalCount: logResult.count
    });
  } catch (error) {
    console.error('채팅 처리 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// API 엔드포인트: 누적 카운트 조회
app.get('/api/count', (req, res) => {
  try {
    res.json({ totalCount });
  } catch (error) {
    console.error('카운트 조회 오류:', error);
    res.status(500).json({ error: '카운트 조회 중 오류가 발생했습니다.' });
  }
});

// API 엔드포인트: 질문 로그 검색
app.post('/api/search-logs', async (req, res) => {
  try {
    const { date, time, question } = req.body;
    
    const logs = await searchQuestionLogs(date, time, question);
    res.json({ logs });
  } catch (error) {
    console.error('로그 검색 오류:', error);
    res.status(500).json({ error: '로그 검색 중 오류가 발생했습니다.' });
  }
});

// API 엔드포인트: 데이터 새로고침
app.post('/api/refresh', async (req, res) => {
  try {
    await loadDiagnosticsData();
    res.json({ message: '데이터가 새로고침되었습니다.', count: diagnosticsData.length });
  } catch (error) {
    console.error('데이터 새로고침 오류:', error);
    res.status(500).json({ error: '데이터 새로고침 중 오류가 발생했습니다.' });
  }
});

// 루트 경로에서 index.html 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 초기화
    await initDatabase();
    
    // 진단 데이터 로드
    await loadDiagnosticsData();
    
    app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
      console.log(`진단 데이터 경로: ${DIAGNOSTICS_PATH}`);
      console.log(`데이터베이스 경로: ${DB_PATH}`);
      console.log(`현재 누적 카운트: ${totalCount}`);
    });
  } catch (error) {
    console.error('서버 시작 오류:', error);
    process.exit(1);
  }
}

// 프로세스 종료 시 데이터베이스 연결 종료
process.on('SIGINT', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('데이터베이스 종료 오류:', err);
      } else {
        console.log('데이터베이스 연결이 종료되었습니다.');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

startServer();

