import { useNavigate, useLocation } from 'react-router-dom'
import './NavigationBar.css'

const NavigationBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/work-data', label: '작업데이터 시각화', icon: '📊' },
    { path: '/sst', label: 'SST', icon: '👥' },
    { path: '/developer', label: 'Developer', icon: '💻' },
    { path: '/variable-control', label: 'Variable Control', icon: '⚙️' },
    { path: '/diagnosis', label: 'Diagnosis', icon: '🔍' },
    { path: '/fle', label: 'FLE', icon: '📈' },
    { path: '/spare-parts', label: 'Spare Parts Demand Forecasting', icon: '📦' },
    { path: '/etc', label: 'etc.', icon: '📍' },
  ]

  return (
    <nav className="navigation-bar">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default NavigationBar










