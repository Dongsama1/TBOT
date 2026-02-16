import { useState } from 'react'
import NavigationBar from './NavigationBar'
import './VariableControl.css'

const VariableControl = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="variable-control-container">
      <div className="variable-control-header">
        <div>
          <h1>Variable Control (가변시비)</h1>
          <p>내용 추후 작성 예정</p>
        </div>
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      <div className="variable-control-content">
        {/* 내용 영역 - 논문/보고서 형식으로 구성 예정 */}
      </div>

      {isMenuOpen && (
        <div className="variable-control-menu">
          {/* 편집 메뉴 - 추후 구현 */}
        </div>
      )}

      <NavigationBar />
    </div>
  )
}

export default VariableControl










