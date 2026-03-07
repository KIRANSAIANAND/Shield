import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
     const [token, setToken] = useState(() => localStorage.getItem('shield_token'))
     const [user, setUser] = useState(() => {
          try { return JSON.parse(localStorage.getItem('shield_user')) } catch { return null }
     })

     const login = (accessToken, userData) => {
          localStorage.setItem('shield_token', accessToken)
          localStorage.setItem('shield_user', JSON.stringify(userData))
          setToken(accessToken)
          setUser(userData)
     }

     const logout = () => {
          localStorage.removeItem('shield_token')
          localStorage.removeItem('shield_user')
          setToken(null)
          setUser(null)
     }

     return (
          <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
               {children}
          </AuthContext.Provider>
     )
}

export function useAuth() {
     const ctx = useContext(AuthContext)
     if (!ctx) throw new Error('useAuth must be used within AuthProvider')
     return ctx
}
