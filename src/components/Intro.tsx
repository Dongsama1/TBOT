import { useNavigate } from 'react-router-dom'
import NavigationBar from './NavigationBar'
import './Intro.css'

const Intro = () => {
  const navigate = useNavigate()

  return (
    <div className="intro-container">
      <div className="intro-header">
        <button className="enter-button" onClick={() => navigate('/work-data')}>
          Enter
        </button>
        <button className="settings-button">⚙️</button>
      </div>
      
      <div className="intro-content">
        <div className="intro-image-container">
          <img 
            src="/tractors.jpg" 
            alt="TYM Tractors" 
            className="intro-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              if (!target.parentElement?.querySelector('.image-placeholder')) {
                const placeholder = document.createElement('div')
                placeholder.className = 'image-placeholder'
                placeholder.textContent = '트랙터 이미지'
                target.parentElement?.appendChild(placeholder)
              }
            }}
          />
        </div>
        <div className="intro-text">
          <h1>Welcome to AI Smart Service team of TYM</h1>
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

export default Intro










