import Papa from 'papaparse'
import { WorkDataRow, WorkDataByDate, FileInfo } from '../types/csv'

export function parseFileName(filename: string): FileInfo {
  const parts = filename.replace('.csv', '').split('_')
  if (parts.length >= 4) {
    return {
      지역명: parts[0],
      구입일자: parts[1],
      기대번호: parts[2],
      고객명: parts.slice(3).join('_'),
      filename: filename,
    }
  }
  return {
    지역명: '',
    구입일자: '',
    기대번호: '',
    고객명: '',
    filename: filename,
  }
}

export function parseCSV(csvText: string): WorkDataRow[] {
  const results: WorkDataRow[] = []
  
  // PapaParse를 사용하여 CSV 파싱 (따옴표 처리 및 쉼표 포함 값 지원)
  const parsed = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
    encoding: 'UTF-8',
  })

  if (!parsed.data || parsed.data.length === 0) return results

  // 첫 번째 줄이 헤더인지 확인
  const firstRow = parsed.data[0] as string[]
  const isHeader = firstRow && (
    firstRow[0]?.includes('작업일자') || 
    firstRow[0]?.includes('작업일') ||
    firstRow[0]?.toLowerCase().includes('date')
  )

  const dataRows = isHeader ? parsed.data.slice(1) : parsed.data

  for (const row of dataRows) {
    const columns = row as string[]
    
    if (columns.length >= 11) {
      try {
        const 작업일자 = (columns[0] || '').trim()
        const 작업주소 = (columns[1] || '').trim()
        const 위도 = parseFloat(columns[2]?.replace(/[^\d.-]/g, '') || '0') || 0
        const 경도 = parseFloat(columns[3]?.replace(/[^\d.-]/g, '') || '0') || 0
        const 작업면적평 = parseFloat(columns[4]?.replace(/[^\d.-]/g, '') || '0') || 0
        const 작업면적제곱미터 = parseFloat(columns[5]?.replace(/[^\d.-]/g, '') || '0') || 0
        const 작업시간 = (columns[6] || '0:00').trim()
        const 순수주행시간 = (columns[7] || '0:00').trim()
        const 순수작업시간 = (columns[8] || '0:00').trim()
        const 작업속도 = parseFloat(columns[9]?.replace(/[^\d.-]/g, '') || '0') || 0
        const 주행속도 = parseFloat(columns[10]?.replace(/[^\d.-]/g, '') || '0') || 0

        // 유효한 데이터인지 확인 (작업일자와 위도/경도가 있어야 함)
        if (작업일자 && (위도 !== 0 || 경도 !== 0)) {
          const workRow: WorkDataRow = {
            작업일자,
            작업주소,
            위도,
            경도,
            작업면적평,
            작업면적제곱미터,
            작업시간,
            순수주행시간,
            순수작업시간,
            작업속도,
            주행속도,
          }
          results.push(workRow)
        }
      } catch (error) {
        console.error('CSV 파싱 오류:', error, row)
      }
    }
  }

  return results
}

export function groupByDate(data: WorkDataRow[]): WorkDataByDate[] {
  const grouped: { [key: string]: WorkDataByDate } = {}

  for (const row of data) {
    const date = row.작업일자
    
    if (!grouped[date]) {
      grouped[date] = {
        작업일자: date,
        작업주소: [],
        위도: [],
        경도: [],
        작업면적평: [],
        작업면적제곱미터: [],
        작업시간: row.작업시간,
        순수주행시간: row.순수주행시간,
        순수작업시간: row.순수작업시간,
        작업속도: row.작업속도,
        주행속도: row.주행속도,
      }
    }

    grouped[date].작업주소.push(row.작업주소)
    grouped[date].위도.push(row.위도)
    grouped[date].경도.push(row.경도)
    grouped[date].작업면적평.push(row.작업면적평)
    grouped[date].작업면적제곱미터.push(row.작업면적제곱미터)
  }

  return Object.values(grouped)
}

export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':')
  if (parts.length === 2) {
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    return hours * 60 + minutes
  }
  return 0
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins.toString().padStart(2, '0')}`
}










