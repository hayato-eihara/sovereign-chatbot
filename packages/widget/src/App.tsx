import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WidgetDemo from './pages/WidgetDemo'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WidgetDemo />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
