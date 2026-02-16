import NavigationBar from './NavigationBar'
import './FLE.css'

const FLE = () => {
  return (
    <div className="fle-container">
      <div className="fle-header">
        <h1>Fault Life Estimation (고장 수명 예측)</h1>
        <button className="menu-button">☰</button>
      </div>

      <div className="fle-content">
        <div className="construction-message">
          수명 예측 공사중
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

export default FLE










