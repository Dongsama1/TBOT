// API URL: 환경에 따라 자동 감지
// 배포 환경: 상대 경로 사용 (같은 도메인)
// 로컬 개발: localhost:3000 사용 (다른 포트에서 개발 서버 실행 시)
const getApiUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // 로컬 개발 환경 (localhost 또는 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // 포트가 3000이 아니면 localhost:3000 사용 (Vite 개발 서버 등)
        if (port && port !== '3000') {
            return 'http://localhost:3000/api';
        }
    }
    
    // 배포 환경 또는 같은 포트에서 실행 중: 상대 경로 사용
    return '/api';
};

const API_URL = getApiUrl();

// DOM 요소
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const refreshButton = document.getElementById('refreshButton');
const dataCount = document.getElementById('dataCount');
const totalCountValue = document.getElementById('totalCountValue');
const searchModal = document.getElementById('searchModal');
const closeModal = document.getElementById('closeModal');
const searchButton = document.getElementById('searchButton');
const searchLogsButton = document.getElementById('searchLogsButton');
const searchResults = document.getElementById('searchResults');
const searchDate = document.getElementById('searchDate');
const searchTime = document.getElementById('searchTime');
const searchQuestion = document.getElementById('searchQuestion');

// 메시지 추가 함수
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // 스크롤을 맨 아래로
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 소스 정보 추가
function addSources(sources) {
    if (!sources || sources.length === 0) return;
    
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';
    
    const title = document.createElement('div');
    title.className = 'sources-title';
    title.textContent = '참고 문서:';
    sourcesDiv.appendChild(title);
    
    sources.forEach(source => {
        const sourceItem = document.createElement('span');
        sourceItem.className = 'source-item';
        sourceItem.textContent = source.replace('.txt', '');
        sourcesDiv.appendChild(sourceItem);
    });
    
    const lastMessage = chatMessages.lastElementChild;
    if (lastMessage) {
        lastMessage.querySelector('.message-content').appendChild(sourcesDiv);
    }
}

// 로딩 표시
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = 'loadingMessage';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span class="loading"></span> 답변을 생성하는 중...';
    
    loadingDiv.appendChild(contentDiv);
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 로딩 제거
function removeLoading() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// 서버에 메시지 전송
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // 사용자 메시지 표시
    addMessage(message, true);
    userInput.value = '';
    
    // 로딩 표시
    showLoading();
    sendButton.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error('서버 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        
        // 로딩 제거
        removeLoading();
        
        // 봇 응답 표시
        addMessage(data.answer);
        
        // 소스 정보 추가
        if (data.sources && data.sources.length > 0) {
            addSources(data.sources);
        }
        
        // 누적 카운트 업데이트
        if (data.totalCount !== undefined) {
            updateTotalCount(data.totalCount);
        }
        
    } catch (error) {
        removeLoading();
        addMessage(`오류가 발생했습니다: ${error.message}`);
        console.error('Error:', error);
    } finally {
        sendButton.disabled = false;
        userInput.focus();
    }
}

// 데이터 새로고침
async function refreshData() {
    refreshButton.disabled = true;
    refreshButton.textContent = '새로고침 중...';
    
    try {
        const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('데이터 새로고침 실패');
        }
        
        const data = await response.json();
        dataCount.textContent = `로드된 파일: ${data.count}개`;
        
        addMessage(`데이터가 새로고침되었습니다. (${data.count}개 파일)`, false);
        
    } catch (error) {
        addMessage(`데이터 새로고침 오류: ${error.message}`, false);
        console.error('Error:', error);
    } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = '데이터 새로고침';
    }
}

// 이벤트 리스너
sendButton.addEventListener('click', sendMessage);
refreshButton.addEventListener('click', refreshData);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 초기 데이터 개수 확인
async function checkDataCount() {
    try {
        const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST'
        });
        if (response.ok) {
            const data = await response.json();
            dataCount.textContent = `로드된 파일: ${data.count}개`;
        }
    } catch (error) {
        dataCount.textContent = '데이터 확인 중...';
    }
}

// 누적 카운트 업데이트
async function updateTotalCount(count) {
    if (totalCountValue) {
        totalCountValue.textContent = count.toLocaleString();
    }
}

// 누적 카운트 조회
async function fetchTotalCount() {
    try {
        const response = await fetch(`${API_URL}/count`);
        if (response.ok) {
            const data = await response.json();
            updateTotalCount(data.totalCount);
        }
    } catch (error) {
        console.error('카운트 조회 오류:', error);
    }
}

// 질문 로그 검색
async function searchLogs() {
    const date = searchDate.value;
    const time = searchTime.value;
    const question = searchQuestion.value.trim();
    
    if (!date && !time && !question) {
        alert('검색 조건을 하나 이상 입력해주세요.');
        return;
    }
    
    searchLogsButton.disabled = true;
    searchLogsButton.textContent = '검색 중...';
    searchResults.innerHTML = '<div class="no-results">검색 중...</div>';
    
    try {
        const response = await fetch(`${API_URL}/search-logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, time, question })
        });
        
        if (!response.ok) {
            throw new Error('검색 실패');
        }
        
        const data = await response.json();
        displaySearchResults(data.logs);
        
    } catch (error) {
        searchResults.innerHTML = `<div class="no-results">검색 중 오류가 발생했습니다: ${error.message}</div>`;
        console.error('Error:', error);
    } finally {
        searchLogsButton.disabled = false;
        searchLogsButton.textContent = '검색';
    }
}

// 검색 결과 표시
function displaySearchResults(logs) {
    if (!logs || logs.length === 0) {
        searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        return;
    }
    
    let html = '';
    logs.forEach(log => {
        const dateTime = new Date(log.created_at);
        const dateStr = dateTime.toLocaleDateString('ko-KR');
        const timeStr = dateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        
        html += `
            <div class="search-result-item">
                <div class="result-date">${dateStr} ${timeStr}</div>
                <div class="result-question">${log.question}</div>
                <div class="result-count">누적 카운트: ${log.count.toLocaleString()}</div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
}

// 모달 열기/닫기
searchButton.addEventListener('click', () => {
    searchModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    searchModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        searchModal.style.display = 'none';
    }
});

// 검색 버튼 이벤트
searchLogsButton.addEventListener('click', searchLogs);

// Enter 키로 검색
searchQuestion.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchLogs();
    }
});

// 페이지 로드 시 데이터 개수 확인 및 누적 카운트 조회
window.addEventListener('load', () => {
    checkDataCount();
    fetchTotalCount();
    userInput.focus();
    
    // 주기적으로 누적 카운트 업데이트 (30초마다)
    setInterval(fetchTotalCount, 30000);
});

