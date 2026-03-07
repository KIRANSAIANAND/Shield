import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Login() {
     const [tab, setTab] = useState('login') // 'login' | 'signup'
     const [form, setForm] = useState({ name: '', email: '', password: '' })
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState('')
     const { login } = useAuth()
     const navigate = useNavigate()

     const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

     const handleSubmit = async e => {
          e.preventDefault()
          setLoading(true)
          setError('')
          const endpoint = tab === 'login' ? '/auth/login' : '/auth/signup'
          const body = tab === 'login'
               ? { email: form.email, password: form.password }
               : { name: form.name, email: form.email, password: form.password }
          try {
               const res = await fetch(`${API}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
               })
               const data = await res.json()
               if (!res.ok) throw new Error(data.detail || 'Something went wrong')
               login(data.access_token, data.user)
               navigate('/')
          } catch (err) {
               setError(err.message)
          } finally {
               setLoading(false)
          }
     }

     return (
          <div style={{
               minHeight: '100vh',
               background: 'var(--bg-primary)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               padding: '20px',
               position: 'relative',
               overflow: 'hidden',
          }}>
               {/* Glow blobs */}
               <div style={{
                    position: 'absolute', top: '-20%', left: '-10%',
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, #00d4ff08 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
               }} />
               <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, #1d6ff310 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
               }} />

               <div className="fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                         <div style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '52px', height: '52px', borderRadius: '14px',
                              background: 'linear-gradient(135deg, #1d6ff3, #00d4ff)',
                              marginBottom: '14px', boxShadow: '0 0 30px #1d6ff340',
                         }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                   <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" opacity="0.9" />
                              </svg>
                         </div>
                         <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                              SHIELD
                         </div>
                         <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', letterSpacing: '0.08em' }}>
                              CREDIT INTELLIGENCE PLATFORM
                         </div>
                    </div>

                    {/* Card */}
                    <div style={{
                         background: 'var(--bg-card)',
                         border: '1px solid var(--border-color)',
                         borderRadius: '18px',
                         padding: '32px',
                         boxShadow: '0 24px 60px #00000060',
                    }}>
                         {/* Tabs */}
                         <div style={{
                              display: 'flex', gap: '4px',
                              background: 'var(--bg-primary)',
                              borderRadius: '10px', padding: '4px',
                              marginBottom: '28px',
                         }}>
                              {['login', 'signup'].map(t => (
                                   <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                                        flex: 1, border: 'none', borderRadius: '7px', padding: '9px',
                                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        transition: 'all 0.2s ease',
                                        background: tab === t ? 'var(--bg-card)' : 'transparent',
                                        color: tab === t ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        boxShadow: tab === t ? '0 1px 6px #00000040' : 'none',
                                   }}>
                                        {t === 'login' ? 'Sign In' : 'Create Account'}
                                   </button>
                              ))}
                         </div>

                         <form onSubmit={handleSubmit}>
                              {tab === 'signup' && (
                                   <div style={{ marginBottom: '16px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
                                             FULL NAME
                                        </label>
                                        <input
                                             name="name" value={form.name} onChange={update}
                                             placeholder="John Doe" required
                                             className="shield-input"
                                             style={{ padding: '12px 14px' }}
                                        />
                                   </div>
                              )}
                              <div style={{ marginBottom: '16px' }}>
                                   <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
                                        EMAIL ADDRESS
                                   </label>
                                   <input
                                        name="email" type="email" value={form.email} onChange={update}
                                        placeholder="you@bank.com" required
                                        className="shield-input"
                                        style={{ padding: '12px 14px' }}
                                   />
                              </div>
                              <div style={{ marginBottom: '24px' }}>
                                   <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>
                                        PASSWORD
                                   </label>
                                   <input
                                        name="password" type="password" value={form.password} onChange={update}
                                        placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••••'}
                                        required minLength={6}
                                        className="shield-input"
                                        style={{ padding: '12px 14px' }}
                                   />
                              </div>

                              {error && (
                                   <div style={{
                                        background: '#ff336615', border: '1px solid #ff336640',
                                        borderRadius: '8px', padding: '10px 14px',
                                        color: 'var(--accent-red)', fontSize: '13px',
                                        marginBottom: '16px',
                                   }}>
                                        {error}
                                   </div>
                              )}

                              <button type="submit" disabled={loading} style={{
                                   width: '100%', border: 'none', borderRadius: '10px',
                                   padding: '13px', fontSize: '14px', fontWeight: 700,
                                   cursor: loading ? 'not-allowed' : 'pointer',
                                   fontFamily: 'Inter, sans-serif',
                                   background: loading
                                        ? 'var(--border-color)'
                                        : 'linear-gradient(135deg, #1d6ff3, #00d4ff)',
                                   color: 'white',
                                   transition: 'all 0.2s ease',
                                   boxShadow: loading ? 'none' : '0 4px 20px #1d6ff340',
                                   letterSpacing: '0.02em',
                              }}>
                                   {loading
                                        ? '⟳ Processing...'
                                        : tab === 'login' ? '→ Sign In to SHIELD' : '→ Create Account'}
                              </button>
                         </form>

                         <div style={{
                              marginTop: '20px', textAlign: 'center',
                              fontSize: '12px', color: 'var(--text-muted)',
                         }}>
                              {tab === 'login'
                                   ? <>No account yet? <span onClick={() => { setTab('signup'); setError('') }} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>Create one →</span></>
                                   : <>Already have an account? <span onClick={() => { setTab('login'); setError('') }} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}>Sign in →</span></>
                              }
                         </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
                         Intelli-Credit Hackathon 2026 · Powered by Groq Llama 3.3-70B
                    </div>
               </div>
          </div>
     )
}
