import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import NavigationBar from './NavigationBar'
import { parseCSV, parseFileName, groupByDate, parseTimeToMinutes, formatTime } from '../utils/csvParser'
import { WorkDataByDate, FileInfo } from '../types/csv'
import './WorkDataVisualization.css'
import 'leaflet/dist/leaflet.css'

// Leaflet 마커 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapController = ({ center }: { center: LatLngExpression }) => {
  const map = useMap()
  map.setView(center, map.getZoom())
  return null
}

const WorkDataVisualization = () => {
  const [activeTab, setActiveTab] = useState<'data' | 'statistics'>('data')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [workData, setWorkData] = useState<WorkDataByDate[]>([])
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showStatistics, setShowStatistics] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const fileArray = Array.from(files).slice(0, 1000) // 최대 1000개 파일
    setSelectedFiles(fileArray)

    const allData: WorkDataByDate[] = []
    const infos: FileInfo[] = []

    for (const file of fileArray) {
      const info = parseFileName(file.name)
      infos.push(info)

      try {
        const text = await file.text()
        const parsed = parseCSV(text)
        const grouped = groupByDate(parsed)
        allData.push(...grouped)
      } catch (error) {
        console.error(`파일 ${file.name} 파싱 오류:`, error)
      }
    }

    setWorkData(allData)
    setFileInfos(infos)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  const handleDisplayOnMap = () => {
    // 데이터가 이미 파싱되어 있으므로 지도에 표시됨
    setShowStatistics(false)
  }

  const calculateStatistics = () => {
    const totalFiles = fileInfos.length
    const totalWorkAreaPyeong = workData.reduce((sum, date) => 
      sum + date.작업면적평.reduce((a, b) => a + b, 0), 0
    )
    const totalWorkAreaM2 = workData.reduce((sum, date) => 
      sum + date.작업면적제곱미터.reduce((a, b) => a + b, 0), 0
    )
    const workDays = new Set(workData.map(d => d.작업일자)).size
    const customers = new Set(fileInfos.map(f => f.고객명)).size
    
    const totalWorkTimeMinutes = workData.reduce((sum, date) => 
      sum + parseTimeToMinutes(date.작업시간), 0
    )
    const totalDrivingTimeMinutes = workData.reduce((sum, date) => 
      sum + parseTimeToMinutes(date.순수주행시간), 0
    )

    const avgWorkSpeed = workData.length > 0
      ? workData.reduce((sum, date) => sum + date.작업속도, 0) / workData.length
      : 0
    const avgDrivingSpeed = workData.length > 0
      ? workData.reduce((sum, date) => sum + date.주행속도, 0) / workData.length
      : 0

    return {
      파일수: totalFiles,
      총작업면적: totalWorkAreaPyeong,
      작업일수: workDays,
      고객수: customers,
      총작업시간: formatTime(totalWorkTimeMinutes),
      총주행시간: formatTime(totalDrivingTimeMinutes),
      평균작업속도: avgWorkSpeed.toFixed(2),
      평균주행속도: avgDrivingSpeed.toFixed(2),
    }
  }

  const stats = calculateStatistics()

  // 지도 중심점 계산 (데이터가 있으면 첫 번째 마커, 없으면 서울)
  const mapCenter: LatLngExpression = workData.length > 0 && workData[0].위도.length > 0
    ? [workData[0].위도[0], workData[0].경도[0]]
    : [37.5665, 126.9780] // 서울

  return (
    <div className="work-data-container">
      <div className="work-data-header">
        <h1>작업 데이터 시각화</h1>
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰ 메뉴
        </button>
      </div>

      <div className="work-data-content">
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} />
            {workData.map((dateData, dateIndex) =>
              dateData.위도.map((lat, idx) => {
                if (lat === 0 || dateData.경도[idx] === 0) return null
                return (
                  <Marker
                    key={`${dateIndex}-${idx}`}
                    position={[lat, dateData.경도[idx]]}
                  >
                    <Popup>
                      <div>
                        <strong>작업일자:</strong> {dateData.작업일자}<br />
                        <strong>작업주소:</strong> {dateData.작업주소[idx]}<br />
                        <strong>작업면적:</strong> {dateData.작업면적평[idx]}평 ({dateData.작업면적제곱미터[idx]}㎡)<br />
                        {idx === 0 && (
                          <>
                            <strong>작업시간:</strong> {dateData.작업시간}<br />
                            <strong>순수주행시간:</strong> {dateData.순수주행시간}<br />
                            <strong>순수작업시간:</strong> {dateData.순수작업시간}<br />
                            <strong>작업속도:</strong> {dateData.작업속도} km/h<br />
                            <strong>주행속도:</strong> {dateData.주행속도} km/h
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              })
            )}
          </MapContainer>
        </div>

        {isMenuOpen && (
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>작업 데이터 시각화</h2>
              <button onClick={() => setIsMenuOpen(false)}>✕</button>
            </div>

            <div className="sidebar-tabs">
              <button
                className={activeTab === 'data' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('data')
                  setShowStatistics(false)
                }}
              >
                ● 데이터 추가
              </button>
              <button
                className={activeTab === 'statistics' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('statistics')
                  setShowStatistics(true)
                }}
              >
                통계
              </button>
            </div>

            {activeTab === 'data' && (
              <div className="sidebar-content">
                <div
                  className={`file-drop-zone ${dragActive ? 'active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-zone-content">
                    <div className="cloud-icon">☁️</div>
                    <div className="drop-zone-text">
                      CSV 파일을 드래그하거나 클릭하여 선택
                    </div>
                    <div className="file-format">
                      형식: 작업일자, 작업주소, 위도, 경도, 작업면적(평), 작업면적(㎡), 작업시간, 순수주행시간, 순수작업시간, 작업속도, 주행속도
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />

                <div className="selected-file">
                  <label>선택된 파일:</label>
                  <input
                    type="text"
                    value={selectedFiles.map(f => f.name).join(', ') || ''}
                    readOnly
                    placeholder="파일 또는 폴더 경로를 입력하거나 위에서 선택하세요"
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>

                <button className="display-button" onClick={handleDisplayOnMap}>
                  ▶ 지도에 표시하기
                </button>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="statistics-content">
                <div className="overall-statistics">
                  <h3>전체 통계</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{stats.파일수}</div>
                      <div className="stat-label">파일수</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.총작업면적.toFixed(2)}</div>
                      <div className="stat-label">총 작업면적(평)</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.작업일수}</div>
                      <div className="stat-label">작업일 수</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.고객수}</div>
                      <div className="stat-label">고객수</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.총작업시간}</div>
                      <div className="stat-label">총 작업시간</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.총주행시간}</div>
                      <div className="stat-label">총 주행시간</div>
                    </div>
                  </div>
                </div>

                <div className="statistics-buttons">
                  <button className="stat-button">고객 분석</button>
                  <button className="stat-button">작업 분석</button>
                  <button className="stat-button">작업 순위</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  )
}

export default WorkDataVisualization










