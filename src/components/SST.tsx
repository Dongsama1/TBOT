import { useState } from 'react'
import NavigationBar from './NavigationBar'
import './SST.css'

const SST = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="sst-container">
      <div className="sst-header">
        <div className="sst-title-section">
          <h1>SST (Smart Service Team)</h1>
          <p>안녕하세요. 스마트서비스팀 입니다.</p>
        </div>
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      <div className="sst-content">
        {/* 내용 영역 - 추후 편집 가능 */}
      </div>

      {isMenuOpen && (
        <div className="sst-menu">
          {/* 편집 메뉴 - 추후 구현 */}
        </div>
      )}

      <NavigationBar />
    </div>
  )
}

export default SST










