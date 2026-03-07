import { useNavigate } from 'react-router-dom'
import ShieldLogo from '../components/ShieldLogo'

function LiveCaseCard() {
     return (
          <div style={{
               background: '#111827',
               border: '1px solid #1e2d45',
               borderRadius: '16px',
               padding: '24px',
               width: '100%',
               maxWidth: '340px',
          }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#7b90b0', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                         Live Case Study
                    </span>
                    <span className="badge-high">HIGH RISK</span>
               </div>

               <div style={{ fontWeight: 700, fontSize: '18px', color: '#e8edf5', marginBottom: '4px' }}>
                    Arvind Steel & Alloys
               </div>
               <div style={{ fontSize: '11px', color: '#7b90b0', marginBottom: '20px' }}>
                    CAM-2026-0342 · ₹18 Cr Loan Application
               </div>

               {/* Score gauge */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <ScoreGaugeMini score={42} />
                    <div>
                         <div style={{ fontWeight: 700, fontSize: '15px', color: '#e8edf5' }}>SHIELD Score</div>
                         <div style={{ fontSize: '11px', color: '#7b90b0', marginTop: '2px' }}>
                              XGBoost + SHAP across 5 weighted risk dimensions
                         </div>
                    </div>
               </div>

               {/* Grid metrics */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <MetricCell label="Requested" value="₹18 Cr" color="#e8edf5" />
                    <MetricCell label="Approved" value="₹10 Cr" color="#00d4ff" />
                    <MetricCell label="DSCR" value="1.18x" color="#ffaa00" />
                    <MetricCell label="Exposure" value="₹32.4 Cr" color="#e8edf5" />
               </div>

               {/* Alert */}
               <div style={{ background: '#ffaa0015', border: '1px solid #ffaa0040', borderRadius: '8px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', color: '#ffaa00', lineHeight: 1.5 }}>
                         ⚠ DRT Notice PNB ₹4.2 Cr default – 2 confirmed circular trading loops detected via graph analysis
                    </span>
               </div>
          </div>
     )
}

function MetricCell({ label, value, color }) {
     return (
          <div style={{ background: '#0d1421', borderRadius: '8px', padding: '10px 12px' }}>
               <div style={{ fontSize: '9px', color: '#3d5272', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
               <div style={{ fontWeight: 700, fontSize: '16px', color, fontFamily: 'Space Grotesk' }}>{value}</div>
          </div>
     )
}

function ScoreGaugeMini({ score }) {
     const r = 24
     const circ = 2 * Math.PI * r
     const pct = score / 100
     return (
          <svg width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
               <circle cx="30" cy="30" r={r} stroke="#1e2d45" strokeWidth="5" fill="none" />
               <circle cx="30" cy="30" r={r} stroke="#ff3366" strokeWidth="5" fill="none"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                    strokeLinecap="round" transform="rotate(-90 30 30)"
                    style={{ filter: 'drop-shadow(0 0 6px #ff3366)' }}
               />
               <text x="30" y="35" textAnchor="middle" fill="#ff3366" fontSize="14" fontWeight="800" fontFamily="Space Grotesk">{score}</text>
          </svg>
     )
}

export default function Landing() {
     const navigate = useNavigate()
     return (
          <div style={{ minHeight: '100vh', background: '#080c14' }}>
               {/* Topbar */}
               <nav style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 48px', borderBottom: '1px solid #1e2d45',
                    position: 'sticky', top: 0, zIndex: 50,
                    background: '#080c14cc', backdropFilter: 'blur(12px)'
               }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <ShieldLogo size={32} />
                         <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.08em', color: '#e8edf5' }}>SHIELD</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                         <a href="#how" style={{ color: '#7b90b0', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>How It Works</a>
                         <a href="#modules" style={{ color: '#7b90b0', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Modules</a>
                         <a href="#case" style={{ color: '#7b90b0', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Case Study</a>
                         <button className="btn-primary" onClick={() => navigate('/new-case')}>
                              Start New Case →
                         </button>
                    </div>
               </nav>

               {/* Hero */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '80px 48px', maxWidth: '1200px', margin: '0 auto', gap: '40px' }}>
                    {/* Left */}
                    <div style={{ flex: 1, maxWidth: '560px' }}>
                         <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '8px',
                              background: '#00d4ff15', border: '1px solid #00d4ff30',
                              borderRadius: '20px', padding: '5px 14px', marginBottom: '28px'
                         }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', display: 'inline-block' }} />
                              <span style={{ fontSize: '10px', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.12em' }}>
                                   INTELLI-CREDIT HACKATHON 2026 – LIVE SUBMISSION
                              </span>
                         </div>

                         <h1 style={{ fontSize: '58px', fontWeight: 900, lineHeight: 1.05, marginBottom: '24px', fontFamily: 'Space Grotesk' }}>
                              <span style={{ color: '#e8edf5' }}>End-to-End<br />Credit<br /></span>
                              <span style={{ color: '#00d4ff' }}>Intelligence.</span>
                         </h1>

                         <p style={{ fontSize: '16px', color: '#7b90b0', lineHeight: 1.7, marginBottom: '36px', maxWidth: '440px' }}>
                              SHIELD automates the entire credit appraisal process — from document upload to final CAM report — using AI, graph analytics, and explainable machine learning. In under 15 minutes.
                         </p>

                         <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <button className="btn-cyan" style={{ padding: '14px 28px', fontSize: '15px' }}
                                   onClick={() => navigate('/new-case')}>
                                   Upload Documents & Analyse →
                              </button>
                              <button className="btn-ghost" style={{ padding: '14px 24px', fontSize: '15px' }}
                                   onClick={() => navigate('/dashboard')}>
                                   View Live Case Study
                              </button>
                         </div>
                    </div>

                    {/* Right - Live Case Card */}
                    <div style={{ flexShrink: 0 }}>
                         <LiveCaseCard />
                    </div>
               </div>

               {/* How It Works */}
               <div id="how" style={{ padding: '60px 48px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                         <div style={{ fontSize: '10px', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                              Pipeline Flow
                         </div>
                         <h2 style={{ fontWeight: 800, fontSize: '36px', color: '#e8edf5', fontFamily: 'Space Grotesk' }}>
                              9 AI Modules. One Decision.
                         </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                         {[
                              { n: '01', t: 'Document Ingestion', d: 'OCR + PDF parsing, auto-classification' },
                              { n: '02', t: 'Financial Analysis', d: 'DSCR, D/E, Current Ratio, Margins' },
                              { n: '03', t: 'NLP Parser', d: 'Named entity extraction from docs' },
                              { n: '04', t: 'Circular Trading', d: 'NetworkX graph cycle detection' },
                              { n: '05', t: 'Intelligence Agent', d: 'RAG-powered research & evidence' },
                              { n: '06', t: 'Risk Scoring', d: 'XGBoost SHIELD Score 0–100' },
                              { n: '07', t: 'CAM Report', d: 'Auto-generated DOCX + PDF report' },
                              { n: '08', t: 'Early Warning', d: 'News risk monitoring & alerts' },
                              { n: '09', t: 'AI Chatbot', d: 'Evidence-cited Q&A on case data' },
                         ].map((m) => (
                              <div key={m.n} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                   <div style={{ fontSize: '10px', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>
                                        M{m.n}
                                   </div>
                                   <div style={{ fontWeight: 700, fontSize: '14px', color: '#e8edf5', marginBottom: '6px' }}>{m.t}</div>
                                   <div style={{ fontSize: '11px', color: '#7b90b0', lineHeight: 1.5 }}>{m.d}</div>
                              </div>
                         ))}
                    </div>
               </div>

               {/* Footer */}
               <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #1e2d45', color: '#3d5272', fontSize: '12px' }}>
                    SHIELD © 2026 – Intelli-Credit Hackathon Submission
               </div>
          </div>
     )
}
