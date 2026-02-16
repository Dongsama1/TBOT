export interface WorkDataRow {
  작업일자: string // "2025-09-30"
  작업주소: string // "대구광역시 달성군 옥포읍 교항리 764"
  위도: number
  경도: number
  작업면적평: number
  작업면적제곱미터: number
  작업시간: string // "1:57"
  순수주행시간: string // "0:11"
  순수작업시간: string // "1:46"
  작업속도: number // km/h
  주행속도: number // km/h
}

export interface WorkDataByDate {
  작업일자: string
  작업주소: string[]
  위도: number[]
  경도: number[]
  작업면적평: number[]
  작업면적제곱미터: number[]
  작업시간: string
  순수주행시간: string
  순수작업시간: string
  작업속도: number
  주행속도: number
}

export interface FileInfo {
  지역명: string
  구입일자: string
  기대번호: string
  고객명: string
  filename: string
}










