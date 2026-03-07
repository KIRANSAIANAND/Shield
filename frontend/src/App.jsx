import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import NewCase from './pages/NewCase'
import Dashboard from './pages/Dashboard'
import { AppStateProvider } from './context/AppState'

function App() {
     return (
          <AppStateProvider>
               <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/new-case" element={<NewCase />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/:module" element={<Dashboard />} />
               </Routes>
          </AppStateProvider>
     )
}

export default App
