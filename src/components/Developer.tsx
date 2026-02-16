import { useState } from 'react'
import NavigationBar from './NavigationBar'
import './Developer.css'

const Developer = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [developerCount, setDeveloperCount] = useState(3)
  const [developers, setDevelopers] = useState([
    { name: '김동현', title: '팀장', greeting: '안녕하세요.', intro: '' },
    { name: '임현묵', title: '책임', greeting: '안녕하세요.', intro: '' },
    { name: '김강현', title: '주임', greeting: '안녕하세요.', intro: '' },
  ])

  return (
    <div className="developer-container">
      <div className="developer-header">
        <h1>개발자</h1>
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      <div className="developer-content">
        <div className="developers-grid">
          {developers.slice(0, developerCount).map((dev, index) => (
            <div key={index} className="developer-card">
              <div className="developer-photo">
                <span>사진</span>
              </div>
              <h3>{dev.name} {dev.title}</h3>
              <p className="greeting">{dev.greeting}</p>
              {dev.intro && <p className="intro">{dev.intro}</p>}
            </div>
          ))}
        </div>
      </div>

      {isMenuOpen && (
        <div className="developer-menu">
          <h3>설정</h3>
          <div className="menu-item">
            <label>인원 수:</label>
            <input
              type="number"
              value={developerCount}
              onChange={(e) => setDeveloperCount(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
            />
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  )
}

export default Developer










