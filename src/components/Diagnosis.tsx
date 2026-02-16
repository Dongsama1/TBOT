import NavigationBar from './NavigationBar'
import './Diagnosis.css'

const Diagnosis = () => {
  return (
    <div className="diagnosis-container">
      <div className="diagnosis-header">
        <h1>Diagnosis (진단)</h1>
        <button className="menu-button">☰</button>
      </div>

      <div className="diagnosis-content">
        <div className="construction-message">
          진단 항목 공사중
        </div>
      </div>

      <NavigationBar />
    </div>
  )
}

export default Diagnosis










