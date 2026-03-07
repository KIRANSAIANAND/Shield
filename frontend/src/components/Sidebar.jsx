import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../context/AppState'
import ShieldLogo from './ShieldLogo'
import {
     FileText, TrendingUp, FileSearch, RefreshCw,
     Globe, Zap, BookOpen, AlertTriangle, MessageSquare,
     ChevronRight
} from 'lucide-react'

const modules = [
     { id: 'overview', label: 'Document Ingestion', icon: FileText, num: 'M01' },
     { id: 'financial', label: 'Financial Analysis', icon: TrendingUp, num: 'M02' },
     { id: 'nlp', label: 'NLP Parser', icon: FileSearch, num: 'M03' },
     { id: 'circular-trading', label: 'Circular Trading', icon: RefreshCw, num: 'M04', badge: '2 LOOPS', badgeColor: '#ff3366' },
     { id: 'intelligence', label: 'Intelligence Agent', icon: Globe, num: 'M05' },
     { id: 'risk', label: 'Risk Scoring', icon: Zap, num: 'M06' },
     { id: 'cam', label: 'CAM Report', icon: BookOpen, num: 'M07' },
     { id: 'early-warning', label: 'Early Warning', icon: AlertTriangle, num: 'M08' },
     { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquare, num: 'M09' },
]

export default function Sidebar({ activeModule, onModuleChange, isOpen, setIsOpen }) {
     const navigate = useNavigate()
     const { caseData, pipelineResult } = useAppState()

     const riskLevel = pipelineResult?.risk_assessment?.risk_level || 'HIGH'
     const shieldScore = pipelineResult?.risk_assessment?.shield_score ?? 42

     const riskColor = riskLevel === 'LOW' ? '#00ff87' : riskLevel === 'MEDIUM' ? '#ffaa00' : '#ff3366'

     return (
          <>
               {/* Mobile Overlay */}
               <div
                    className={`sidebar-overlay ${isOpen ? '' : 'hidden'}`}
                    onClick={() => setIsOpen && setIsOpen(false)}
               />

               <div className={`sidebar flex flex-col ${isOpen ? 'open' : ''}`}>
                    {/* Logo */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #1e2d45' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <ShieldLogo size={30} />
                              <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '0.06em', color: '#e8edf5' }}>
                                   SHIELD
                              </span>
                         </div>
                    </div>

                    {/* Live Case */}
                    <div style={{ margin: '12px 12px 4px', background: '#1a0a10', border: '1px solid #ff336630', borderRadius: '8px', padding: '12px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3366', display: 'inline-block' }} className="live-dot" />
                              <span style={{ fontSize: '9px', fontWeight: 700, color: '#ff3366', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                   Live Case
                              </span>
                         </div>
                         <div style={{ fontWeight: 700, fontSize: '13px', color: '#e8edf5', lineHeight: 1.3 }}>
                              {caseData.company_name.replace(' Pvt. Ltd.', '')}
                         </div>
                         <div style={{ fontSize: '10px', color: '#7b90b0', marginTop: '2px' }}>{caseData.case_id}</div>
                    </div>

                    {/* Pipeline label */}
                    <div style={{ padding: '12px 16px 4px', fontSize: '9px', fontWeight: 700, color: '#3d5272', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                         Appraisal Pipeline
                    </div>

                    {/* Nav Items */}
                    <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
                         {modules.map((mod) => {
                              const Icon = mod.icon
                              const isActive = activeModule === mod.id
                              return (
                                   <div
                                        key={mod.id}
                                        className={`nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                             onModuleChange(mod.id)
                                             if (setIsOpen) setIsOpen(false)
                                        }}
                                   >
                                        <Icon size={14} />
                                        <span style={{ flex: 1 }}>{mod.label}</span>
                                        {mod.badge && (
                                             <span style={{
                                                  fontSize: '8px', fontWeight: 700, background: `${mod.badgeColor}20`,
                                                  color: mod.badgeColor, border: `1px solid ${mod.badgeColor}50`,
                                                  borderRadius: '10px', padding: '1px 6px', letterSpacing: '0.05em'
                                             }}>
                                                  {mod.badge}
                                             </span>
                                        )}
                                        <span style={{ fontSize: '9px', color: '#3d5272', fontWeight: 600 }}>{mod.num}</span>
                                   </div>
                              )
                         })}
                    </nav>

                    {/* SHIELD Score Footer */}
                    <div style={{
                         margin: '8px 12px 12px',
                         background: `${riskColor}12`,
                         border: `1px solid ${riskColor}40`,
                         borderRadius: '10px',
                         padding: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '12px',
                    }}>
                         <ShieldScoreMini score={shieldScore} color={riskColor} />
                         <div>
                              <div style={{ fontSize: '9px', color: '#7b90b0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                   SHIELD Score
                              </div>
                              <div style={{ fontWeight: 800, fontSize: '14px', color: riskColor, fontFamily: 'Space Grotesk' }}>
                                   {riskLevel} RISK
                              </div>
                         </div>
                    </div>
               </div>
          </>
     )
}

function ShieldScoreMini({ score, color }) {
     const radius = 18
     const circumference = 2 * Math.PI * radius
     const pct = score / 100
     return (
          <svg width="44" height="44" viewBox="0 0 44 44">
               <circle cx="22" cy="22" r={radius} stroke="#1e2d45" strokeWidth="4" fill="none" />
               <circle
                    cx="22" cy="22" r={radius}
                    stroke={color}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct)}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                    style={{ filter: `drop-shadow(0 0 4px ${color})` }}
               />
               <text x="22" y="26" textAnchor="middle" fill={color} fontSize="11" fontWeight="800" fontFamily="Space Grotesk">
                    {score}
               </text>
          </svg>
     )
}
