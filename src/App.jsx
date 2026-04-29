import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import RdaForm from './pages/RdaForm'
import HistorialClinico from './pages/HistorialClinico'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/rda/:id" element={<RdaForm />} />
      <Route path="/rda/new" element={<RdaForm />} />
      <Route path="/historial/:id" element={<HistorialClinico />} />
    </Routes>
  )
}

export default App
