import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import NewCase from './pages/NewCase'
import Dashboard from './pages/Dashboard'
import { AppStateProvider } from './context/AppState'

function App() {
     return (
          <AuthProvider>
               <AppStateProvider>
                    <Routes>
                         {/* Public */}
                         <Route path="/login" element={<Login />} />

                         {/* Protected */}
                         <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
                         <Route path="/new-case" element={<ProtectedRoute><NewCase /></ProtectedRoute>} />
                         <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                         <Route path="/dashboard/:module" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    </Routes>
               </AppStateProvider>
          </AuthProvider>
     )
}

export default App
