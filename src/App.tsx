import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Intro from './components/Intro'
import WorkDataVisualization from './components/WorkDataVisualization'
import SST from './components/SST'
import Developer from './components/Developer'
import VariableControl from './components/VariableControl'
import Diagnosis from './components/Diagnosis'
import FLE from './components/FLE'
import SparePartsForecasting from './components/SparePartsForecasting'
import Etc from './components/Etc'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/work-data" element={<WorkDataVisualization />} />
        <Route path="/sst" element={<SST />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/variable-control" element={<VariableControl />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/fle" element={<FLE />} />
        <Route path="/spare-parts" element={<SparePartsForecasting />} />
        <Route path="/etc" element={<Etc />} />
      </Routes>
    </Router>
  )
}

export default App










