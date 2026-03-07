import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../context/AppState'
import Sidebar from '../components/Sidebar'
import ShieldLogo from '../components/ShieldLogo'
import { PlusCircle, AlertCircle, AlertTriangle, Info, CheckCircle2, Download, Send } from 'lucide-react'
import {
     PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
     RadialBarChart, RadialBar, Legend
} from 'recharts'
import shieldApi from '../services/api'
import { useAuth } from '../context/AuthContext'

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
     const { module } = useParams()
     const [activeModule, setActiveModule] = useState(module || 'overview')
     const [sidebarOpen, setSidebarOpen] = useState(false)
     const { caseData, pipelineResult } = useAppState()
     const navigate = useNavigate()
     const { user, logout } = useAuth()

     const handleLogout = () => { logout(); navigate('/login') }

     const result = pipelineResult || DEMO_RESULT
     const risk = result.risk_assessment
     const decision = result.loan_decision
     const riskColor = risk.risk_level === 'LOW' ? '#00ff87' : risk.risk_level === 'MEDIUM' ? '#ffaa00' : '#ff3366'

     return (
          <div style={{ display: 'flex', minHeight: '100vh', background: '#080c14' }}>
               <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

               {/* Main Content */}
               <div className="main-content" style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Topbar */}
                    <div className="topbar" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                         <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                   <path d="M3 12h18M3 6h18M3 18h18" />
                              </svg>
                         </button>
                         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div className="topbar-left-content" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                   <div className="text-truncate" style={{ fontWeight: 700, fontSize: '15px', color: '#e8edf5' }}>
                                        {MODULE_TITLES[activeModule] || 'Dashboard Overview'}
                                   </div>
                                   <div className="text-truncate" style={{ fontSize: '10px', color: '#7b90b0', marginTop: '1px' }}>
                                        {result.company} · {result.case_id}
                                   </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                   <span className="badge-high">HIGH RISK</span>

                                   {user && (

                                        <div className="user-pill text-truncate" style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>

                                             👤 {user.name || user.email}

                                        </div>

                                   )}

                                   <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}

                                        onClick={() => navigate('/new-case')}>

                                        <PlusCircle size={13} /> New Case

                                   </button>

                                   <button onClick={handleLogout} style={{

                                        background: 'transparent', border: '1px solid #ff336640',

                                        borderRadius: '8px', padding: '7px 13px',

                                        color: '#ff6688', fontSize: '12px', fontWeight: 600,

                                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',

                                   }}>

                                        Sign Out

                                   </button>

                              </div>

                         </div>
                    </div>

                    {/* Module Views */}
                    <div className="module-padding" style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
                         {activeModule === 'overview' && <OverviewModule result={result} riskColor={riskColor} caseData={caseData} setActiveModule={setActiveModule} />}
                         {activeModule === 'financial' && <FinancialModule result={result} />}
                         {activeModule === 'nlp' && <NLPModule />}
                         {activeModule === 'circular-trading' && <CircularTradingModule result={result} />}
                         {activeModule === 'intelligence' && <IntelligenceModule result={result} />}
                         {activeModule === 'risk' && <RiskModule result={result} riskColor={riskColor} />}
                         {activeModule === 'cam' && <CAMModule result={result} />}
                         {activeModule === 'early-warning' && <EarlyWarningModule result={result} />}
                         {activeModule === 'chatbot' && <ChatbotModule result={result} />}
                    </div>
               </div>
          </div>
     )
}

const MODULE_TITLES = {
     overview: 'Dashboard Overview',
     financial: 'Mo2 – Financial Analysis',
     nlp: 'Mo3 – NLP Parser',
     'circular-trading': 'Mo4 – Circular Trading Detector',
     intelligence: 'Mo5 – Intelligence Agent',
     risk: 'Mo6 – Risk Scoring',
     cam: 'Mo7 – CAM Report Generator',
     'early-warning': 'Mo8 – Early Warning System',
     chatbot: 'Mo9 – AI Credit Intelligence Chatbot',
}

// ─── Environment ─────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Overview (Dashboard) ────────────────────────────────────────────────────
function OverviewModule({ result, riskColor, caseData, setActiveModule }) {
     const r = result.financial_ratios
     const risk = result.risk_assessment
     const decision = result.loan_decision
     const breakdown = risk.breakdown || {}

     const PIE_DATA = [
          { name: 'Document Auth', value: breakdown.document_authenticity || 48 },
          { name: 'Financial Health', value: breakdown.financial_health || 52 },
          { name: 'Circular/Fraud', value: breakdown.circular_trading_fraud || 18 },
          { name: 'Promoter Risk', value: breakdown.promoter_legal_risk || 30 },
          { name: 'Sector Risk', value: breakdown.sector_macro_risk || 55 },
     ]
     const PIE_COLORS = ['#00d4ff', '#1d6ff3', '#ff3366', '#ffaa00', '#7b90b0']

     return (
          <div className="fade-in">
               {/* Header */}
               <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                         <div style={{ width: '32px', height: '2px', background: '#00d4ff' }} />
                         <span style={{ fontSize: '10px', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.12em' }}>CASE OVERVIEW</span>
                    </div>
                    <h2 className="responsive-title" style={{ fontWeight: 800, color: '#e8edf5', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>
                         SHIELD – Credit Appraisal
                    </h2>
                    <p style={{ color: '#7b90b0', fontSize: '13px', lineHeight: 1.5 }}>
                         {result.company} · ₹{result.loan_amount_requested} Cr loan application ·{' '}
                         <span style={{ color: '#ffaa00', display: 'inline-block' }}>Conditional approval recommended</span>
                    </p>
               </div>

               {/* Metric Cards Row */}
               <div className="metric-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                    <MetricCard label="Loan Requested" subLabel="WC + Term Loan" value={`₹${result.loan_amount_requested} Cr`} color="#e8edf5" />
                    <MetricCard label="Approved Amount" subLabel={`MCLR+2.50% · 24m`} value={`₹${result.loan_amount_approved} Cr`} color="#00d4ff" />
                    <MetricCard label="SHIELD Score" subLabel="High Risk" value={`${risk.shield_score}/100`} color={riskColor} />
                    <MetricCard label="Appraisal Time" subLabel="vs. 3-5 days manual" value="<15m" color="#00ff87" />
               </div>

               {/* Content Grid */}
               <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Left - Score Breakdown */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 700, fontSize: '16px', color: '#e8edf5' }}>SHIELD Score Breakdown</span>
                              <span style={{ fontSize: '11px', background: `${riskColor}20`, color: riskColor, border: `1px solid ${riskColor}40`, padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                   {risk.shield_score}/100
                              </span>
                         </div>
                         <p style={{ fontSize: '11px', color: '#7b90b0', marginBottom: '20px' }}>
                              XGBoost with SHAP – 5 weighted risk dimensions
                         </p>
                         <div style={{ marginBottom: '20px' }}>
                              {Object.entries(breakdown).map(([key, val], i) => {
                                   const labels = { document_authenticity: 'Document Authenticity', financial_health: 'Financial Health', circular_trading_fraud: 'Circular Trading / Fraud', promoter_legal_risk: 'Promoter & Legal Risk', sector_macro_risk: 'Sector & Macro Risk' }
                                   const colors = ['#00d4ff', '#1d6ff3', '#ff3366', '#ffaa00', '#7b90b0']
                                   return (
                                        <div key={key} style={{ marginBottom: '14px' }}>
                                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                  <span style={{ fontSize: '12px', color: '#e8edf5' }}>{labels[key] || key}</span>
                                                  <span style={{ fontSize: '11px', color: '#7b90b0' }}>{val}<span style={{ fontSize: '9px' }}>/100</span></span>
                                             </div>
                                             <div className="progress-bar">
                                                  <div className="progress-bar-fill" style={{ width: `${val}%`, background: colors[i] }} />
                                             </div>
                                        </div>
                                   )
                              })}
                         </div>
                         {/* Pie Chart */}
                         <ResponsiveContainer width="100%" height={160}>
                              <PieChart>
                                   <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                        {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                   </Pie>
                                   <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', fontSize: '11px', color: '#e8edf5' }} />
                              </PieChart>
                         </ResponsiveContainer>
                    </div>

                    {/* Right - Critical Risk Flags */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                         <div style={{ fontWeight: 700, fontSize: '16px', color: '#e8edf5', marginBottom: '4px' }}>Critical Risk Flags</div>
                         <p style={{ fontSize: '11px', color: '#7b90b0', marginBottom: '20px' }}>Detected across all 9 modules</p>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {result.circular_trading?.fraud_detected && (
                                   <RiskFlag type="critical" icon="🔴" title={`Circular Trading – ${result.circular_trading.cycle_count} Confirmed Loops`}
                                        desc="₹32.6 Cr in circular GST transactions. Average GSTR-2A/3B gap: 24.7%. Graph analysis via M04." />
                              )}
                              <RiskFlag type="warning" icon="⚠" title="DRT Notice – Punjab National Bank"
                                   desc="₹4.2 Cr default. Promoter Rajesh Gupta named guarantor. OA 142/2025 – hearing 28 Feb 2026." />
                              {r?.dscr < 1.5 && (
                                   <RiskFlag type="info" icon="📊" title={`DSCR ${r.dscr}x – Below Min Threshold`}
                                        desc="Minimum required: 1.5x. Adjusted for circular trading inflation: 0.94x." />
                              )}
                              <RiskFlag type="success" icon="✅" title={`${decision.decision} – ₹${result.loan_amount_approved} Cr`}
                                   desc={`${decision.conditions?.length || 4} pre-disbursement conditions + monthly EWS monitoring required.`} />
                         </div>

                         {/* Decision Reasons */}
                         {decision.reasons?.length > 0 && (
                              <div style={{ marginTop: '20px', padding: '14px', background: '#0d1421', borderRadius: '8px', border: '1px solid #1e2d45' }}>
                                   <div style={{ fontSize: '11px', color: '#7b90b0', fontWeight: 600, marginBottom: '10px' }}>Decision Basis</div>
                                   {decision.reasons.map((r, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#e8edf5', marginBottom: '5px' }}>• {r}</div>
                                   ))}
                              </div>
                         )}
                    </div>
               </div>
          </div>
     )
}

// ─── Financial Analysis ──────────────────────────────────────────────────────
function FinancialModule({ result }) {
     const r = result.financial_ratios
     const ratioCards = [
          { label: 'Debt to Equity', value: r?.debt_to_equity, unit: 'x', good: v => v < 2, tip: '< 2.0x preferred' },
          { label: 'Current Ratio', value: r?.current_ratio, unit: 'x', good: v => v >= 1.5, tip: '≥ 1.5x preferred' },
          { label: 'Profit Margin', value: r?.profit_margin ? `${(r.profit_margin * 100).toFixed(1)}` : 'N/A', unit: '%', good: v => parseFloat(v) >= 10, tip: '≥ 10% preferred' },
          { label: 'DSCR', value: r?.dscr, unit: 'x', good: v => v >= 1.5, tip: '≥ 1.5x required' },
     ]
     return (
          <div className="fade-in">
               <ModuleHeader num="M02" title="Financial Analysis" subtitle="Key financial ratios computed from borrower data" />
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {ratioCards.map(rc => {
                         const isGood = rc.good(rc.value)
                         const color = isGood ? '#00ff87' : rc.value && rc.good(rc.value * 0.7) ? '#ffaa00' : '#ff3366'
                         return (
                              <div key={rc.label} className="glass-card" style={{ padding: '22px', textAlign: 'center' }}>
                                   <div style={{ fontSize: '10px', color: '#7b90b0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{rc.label}</div>
                                   <div style={{ fontWeight: 900, fontSize: '32px', color, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                                        {rc.value ?? 'N/A'}<span style={{ fontSize: '16px', fontWeight: 400 }}>{typeof rc.value === 'number' && rc.unit}</span>
                                   </div>
                                   <div style={{ marginTop: '8px' }}>
                                        <span style={{ fontSize: '10px', background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: '10px', padding: '2px 8px', fontWeight: 600 }}>
                                             {isGood ? '✓ HEALTHY' : '✗ BELOW THRESHOLD'}
                                        </span>
                                   </div>
                                   <div style={{ fontSize: '10px', color: '#3d5272', marginTop: '6px' }}>{rc.tip}</div>
                              </div>
                         )
                    })}
               </div>
               <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#e8edf5', marginBottom: '16px' }}>Full Financial Profile</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                         {result.financial_ratios && Object.entries(result.financial_ratios).map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#0d1421', borderRadius: '7px' }}>
                                   <span style={{ fontSize: '12px', color: '#7b90b0' }}>{k.replace(/_/g, ' ').toUpperCase()}</span>
                                   <span style={{ fontSize: '13px', color: '#e8edf5', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{typeof v === 'number' ? v.toFixed(2) : v}</span>
                              </div>
                         ))}
                    </div>
               </div>
          </div>
     )
}

// ─── NLP Parser ─────────────────────────────────────────────────────────────
function NLPModule() {
     const entities = [
          { type: 'COMPANY', value: 'Arvind Steel & Alloys Pvt. Ltd.', source: 'Balance Sheet' },
          { type: 'PERSON', value: 'Rajesh Gupta', source: 'Legal Doc' },
          { type: 'AMOUNT', value: '₹18 Crore', source: 'CAM Application' },
          { type: 'DATE', value: '28 Feb 2026', source: 'DRT Notice' },
          { type: 'BANK', value: 'Punjab National Bank', source: 'DRT Notice' },
          { type: 'AMOUNT', value: '₹4.2 Crore Default', source: 'DRT Notice' },
          { type: 'LEGAL', value: 'OA 142/2025 – Debt Recovery Tribunal', source: 'Legal Doc' },
          { type: 'COMPANY', value: 'Shell Entity Alpha Pvt. Ltd.', source: 'GST Returns' },
     ]
     const typeColors = { COMPANY: '#00d4ff', PERSON: '#00ff87', AMOUNT: '#ffaa00', DATE: '#7b90b0', BANK: '#1d6ff3', LEGAL: '#ff3366' }
     return (
          <div className="fade-in">
               <ModuleHeader num="M03" title="NLP Parser" subtitle="Named entity extraction from uploaded documents" />
               <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                         {entities.map((e, i) => (
                              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#0d1421', borderRadius: '8px', padding: '12px 14px' }}>
                                   <span style={{ fontSize: '9px', fontWeight: 700, background: `${typeColors[e.type] || '#7b90b0'}20`, color: typeColors[e.type] || '#7b90b0', border: `1px solid ${typeColors[e.type] || '#7b90b0'}40`, borderRadius: '6px', padding: '2px 7px', whiteSpace: 'nowrap', marginTop: '1px' }}>{e.type}</span>
                                   <div>
                                        <div style={{ fontSize: '13px', color: '#e8edf5', fontWeight: 600 }}>{e.value}</div>
                                        <div style={{ fontSize: '10px', color: '#3d5272', marginTop: '2px' }}>Source: {e.source}</div>
                                   </div>
                              </div>
                         ))}
                    </div>
               </div>
          </div>
     )
}

// ─── Circular Trading ────────────────────────────────────────────────────────
function CircularTradingModule({ result }) {
     const ct = result.circular_trading || {}
     const graph = ct.graph || { nodes: [], edges: [] }
     return (
          <div className="fade-in">
               <ModuleHeader num="M04" title="Circular Trading Detector" subtitle="NetworkX graph analysis – cycle detection across transaction networks" />
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                         <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                              <StatBadge label="Loops Detected" value={ct.cycle_count || 0} color="#ff3366" />
                              <StatBadge label="Nodes" value={graph.nodes?.length || 0} color="#00d4ff" />
                              <StatBadge label="Edges" value={graph.edges?.length || 0} color="#ffaa00" />
                         </div>
                         {ct.fraud_detected ? (
                              <div style={{ background: '#ff336615', border: '1px solid #ff336640', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                                   <div style={{ fontWeight: 700, color: '#ff3366', marginBottom: '6px' }}>🔴 Circular Trading Detected</div>
                                   {ct.cycles?.map((cycle, i) => (
                                        <div key={i} style={{ fontSize: '12px', color: '#e8edf5', marginBottom: '4px' }}>
                                             Loop {i + 1}: {cycle.join(' → ')}
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div style={{ background: '#00ff8715', border: '1px solid #00ff8740', borderRadius: '8px', padding: '14px' }}>
                                   <div style={{ fontWeight: 700, color: '#00ff87' }}>✅ No Circular Trading Detected</div>
                              </div>
                         )}
                         <div style={{ fontSize: '12px', color: '#7b90b0', marginTop: '12px', lineHeight: 1.6 }}>
                              Analysis based on directed graph of GST transactions. Simple cycles algorithm via NetworkX. ₹32.6 Cr in suspicious GST flows identified.
                         </div>
                    </div>
                    {/* Network Visualization */}
                    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <div style={{ fontWeight: 600, fontSize: '14px', color: '#e8edf5', marginBottom: '16px' }}>Transaction Network Graph</div>
                         <NetworkGraph nodes={graph.nodes} edges={graph.edges} cycles={ct.cycles} />
                    </div>
               </div>
          </div>
     )
}

function NetworkGraph({ nodes = [], edges = [], cycles = [] }) {
     if (!nodes.length) {
          nodes = [
               { id: 'Arvind Steel' }, { id: 'Shell Co A' }, { id: 'Shell Co B' }, { id: 'Entity C' }
          ]
          edges = [
               { from: 'Arvind Steel', to: 'Shell Co A' }, { from: 'Shell Co A', to: 'Shell Co B' },
               { from: 'Shell Co B', to: 'Arvind Steel' }, { from: 'Arvind Steel', to: 'Entity C' }
          ]
          cycles = [['Arvind Steel', 'Shell Co A', 'Shell Co B']]
     }
     const cycleNodes = new Set(cycles.flat())
     const positions = {}
     nodes.forEach((n, i) => {
          const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
          positions[n.id] = { x: 140 + 100 * Math.cos(angle), y: 140 + 100 * Math.sin(angle) }
     })
     return (
          <svg width="280" height="280" viewBox="0 0 280 280">
               {/* Edges */}
               {edges.map((e, i) => {
                    const from = positions[e.from], to = positions[e.to]
                    if (!from || !to) return null
                    const inCycle = cycles.some(c => c.includes(e.from) && c.includes(e.to))
                    return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={inCycle ? '#ff3366' : '#1e2d45'} strokeWidth={inCycle ? 2.5 : 1.5} markerEnd="url(#arrow)" style={inCycle ? { filter: 'drop-shadow(0 0 4px #ff3366)' } : {}} />
               })}
               {/* Arrow marker */}
               <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                         <path d="M0,0 L6,3 L0,6 Z" fill="#ff3366" />
                    </marker>
               </defs>
               {/* Nodes */}
               {nodes.map((n) => {
                    const pos = positions[n.id]
                    if (!pos) return null
                    const inCycle = cycleNodes.has(n.id)
                    return (
                         <g key={n.id}>
                              <circle cx={pos.x} cy={pos.y} r={28} fill={inCycle ? '#ff336620' : '#111827'} stroke={inCycle ? '#ff3366' : '#1e2d45'} strokeWidth={inCycle ? 2 : 1} style={inCycle ? { filter: 'drop-shadow(0 0 6px #ff3366)' } : {}} />
                              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill={inCycle ? '#ff3366' : '#7b90b0'} fontSize="8" fontWeight="600">{n.id.length > 12 ? n.id.slice(0, 12) + '..' : n.id}</text>
                         </g>
                    )
               })}
          </svg>
     )
}

// ─── Intelligence Agent ──────────────────────────────────────────────────────
function IntelligenceModule({ result }) {
     const insights = [
          { icon: '🔍', title: 'GSTR-2A / 3B Mismatch', detail: 'Average gap of 24.7% detected across 6 quarters. Indicative of GST-based circular trading inflation.' },
          { icon: '⚖️', title: 'Legal Background Check', detail: 'DRT OA 142/2025 confirmed. PNB filed suit for ₹4.2 Cr default. Guarantor: Rajesh Gupta.' },
          { icon: '📰', title: 'News Sentiment Score', detail: `News risk: ${result.risk_assessment?.breakdown ? '3/5' : '3/5'}. Negative press involving steel sector slowdown Q3-Q4 2025.` },
          { icon: '🏭', title: 'Sector Intelligence', detail: 'Steel MSME sector facing margin compression: Coal prices +18%, Power surcharge hike, Oversupply from China imports.' },
     ]
     return (
          <div className="fade-in">
               <ModuleHeader num="M05" title="Intelligence Agent" subtitle="RAG-powered research grounded on case documents and public data" />
               <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {insights.map((ins, i) => (
                         <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                              <span style={{ fontSize: '24px', flexShrink: 0 }}>{ins.icon}</span>
                              <div>
                                   <div style={{ fontWeight: 700, fontSize: '14px', color: '#e8edf5', marginBottom: '6px' }}>{ins.title}</div>
                                   <div style={{ fontSize: '13px', color: '#7b90b0', lineHeight: 1.6 }}>{ins.detail}</div>
                              </div>
                         </div>
                    ))}
               </div>
          </div>
     )
}

// ─── Risk Scoring ────────────────────────────────────────────────────────────
function RiskModule({ result, riskColor }) {
     const risk = result.risk_assessment
     const breakdown = risk.breakdown || {}
     const score = risk.shield_score
     const r = 80
     const circ = 2 * Math.PI * r
     const pct = score / 100

     return (
          <div className="fade-in">
               <ModuleHeader num="M06" title="Risk Scoring" subtitle="XGBoost classifier with SHAP explainability – 5 weighted dimensions" />
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Gauge */}
                    <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <svg width="200" height="200" viewBox="0 0 200 200">
                              <circle cx="100" cy="100" r={r} stroke="#1e2d45" strokeWidth="10" fill="none" />
                              <circle cx="100" cy="100" r={r} stroke={riskColor} strokeWidth="10" fill="none"
                                   strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                                   strokeLinecap="round" transform="rotate(-90 100 100)"
                                   style={{ filter: `drop-shadow(0 0 12px ${riskColor})`, transition: 'stroke-dashoffset 1.5s ease' }}
                              />
                              <text x="100" y="92" textAnchor="middle" fill={riskColor} fontSize="42" fontWeight="900" fontFamily="Space Grotesk">{score}</text>
                              <text x="100" y="115" textAnchor="middle" fill="#7b90b0" fontSize="12">/100</text>
                         </svg>
                         <div style={{ marginTop: '12px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 800, fontSize: '22px', color: riskColor, fontFamily: 'Space Grotesk' }}>{risk.risk_level} RISK</div>
                              <div style={{ fontSize: '12px', color: '#7b90b0', marginTop: '4px' }}>Default Probability: {(risk.default_probability * 100).toFixed(1)}%</div>
                         </div>
                    </div>
                    {/* Breakdown bars */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                         <div style={{ fontWeight: 700, fontSize: '15px', color: '#e8edf5', marginBottom: '20px' }}>Dimension Scores</div>
                         {Object.entries(breakdown).map(([key, val], i) => {
                              const labels = { document_authenticity: 'Document Authenticity', financial_health: 'Financial Health', circular_trading_fraud: 'Circular Trading / Fraud', promoter_legal_risk: 'Promoter & Legal Risk', sector_macro_risk: 'Sector & Macro Risk' }
                              const colors = ['#00d4ff', '#1d6ff3', '#ff3366', '#ffaa00', '#7b90b0']
                              return (
                                   <div key={key} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                             <span style={{ fontSize: '13px', color: '#e8edf5' }}>{labels[key] || key}</span>
                                             <span style={{ fontWeight: 700, fontSize: '13px', color: colors[i], fontFamily: 'Space Grotesk' }}>{val}</span>
                                        </div>
                                        <div className="progress-bar">
                                             <div className="progress-bar-fill" style={{ width: `${val}%`, background: colors[i] }} />
                                        </div>
                                   </div>
                              )
                         })}
                    </div>
               </div>
          </div>
     )
}

// ─── CAM Report ──────────────────────────────────────────────────────────────
function CAMModule({ result }) {
     const { caseData, camGenerated, setCamGenerated } = useAppState()
     const [generating, setGenerating] = useState(false)
     const [downloadingFmt, setDownloadingFmt] = useState(null)
     const [genResult, setGenResult] = useState(null)
     const [errorMsg, setErrorMsg] = useState(null)

     const CAM_PAYLOAD = {
          company_name: result.company,
          loan_amount_cr: result.loan_amount_requested,
          case_id: result.case_id,
          ratios: result.financial_ratios,
          risk_result: result.risk_assessment,
          loan_decision: result.loan_decision,
          fraud_result: result.fraud_analysis,
          circular_result: result.circular_trading,
     }

     const handleGenerate = async () => {
          setGenerating(true)
          setErrorMsg(null)
          try {
               const res = await fetch(`${API_URL}/generate-cam`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(CAM_PAYLOAD),
               })
               if (!res.ok) throw new Error(await res.text())
               const data = await res.json()
               setGenResult(data)
               setCamGenerated(true)
          } catch (err) {
               // Demo fallback — mark as generated so download buttons appear
               setGenResult({ case_id: result.case_id })
               setCamGenerated(true)
               setErrorMsg('Backend offline – download buttons will call generate-and-download in one shot.')
          } finally {
               setGenerating(false)
          }
     }

     const handleDownload = async (fmt) => {
          setDownloadingFmt(fmt)
          setErrorMsg(null)
          try {
               // Use the combined generate+download endpoint
               const res = await fetch(`${API_URL}/generate-download-cam/${fmt}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(CAM_PAYLOAD),
               })
               if (!res.ok) throw new Error(await res.text())

               // Build filename: CAM_Report_ArvindSteel_CAM-2026-0342.docx
               const cleanCompany = (result.company || 'Company')
                    .replace(/&/g, 'and')
                    .replace(/[^\w\s]/g, '')
                    .trim()
                    .replace(/\s+/g, '_')
                    .replace(/_+/g, '_')
               const clientFilename = `CAM_Report_${cleanCompany}_${result.case_id}.${fmt}`
               // Server sends X-Download-Filename header — use it as authoritative name
               const finalFilename = res.headers.get('X-Download-Filename') || clientFilename

               const blob = await res.blob()
               const url = URL.createObjectURL(blob)
               const a = document.createElement('a')
               a.href = url
               a.download = finalFilename
               document.body.appendChild(a)
               a.click()
               document.body.removeChild(a)
               // Delay revoke so Chrome finalises filename before blob is released
               setTimeout(() => URL.revokeObjectURL(url), 3000)
          } catch (err) {
               setErrorMsg(`Download failed: ${err.message}. Make sure the backend is running (uvicorn main:app --reload).`)
          } finally {
               setDownloadingFmt(null)
          }
     }

     const caseId = genResult?.case_id || result.case_id

     return (
          <div className="fade-in">
               <ModuleHeader num="M07" title="CAM Report Generator" subtitle="Auto-generated Credit Appraisal Memo – DOCX, PDF, JSON" />
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Preview */}
                    <div className="glass-card" style={{ padding: '28px' }}>
                         <div style={{ fontWeight: 700, fontSize: '16px', color: '#e8edf5', marginBottom: '16px' }}>Report Preview</div>
                         {[
                              ['Company', result.company],
                              ['Case ID', result.case_id],
                              ['Loan Amount', `₹${result.loan_amount_requested} Cr`],
                              ['Approved', `₹${result.loan_amount_approved} Cr`],
                              ['SHIELD Score', `${result.risk_assessment?.shield_score}/100`],
                              ['Risk Level', result.risk_assessment?.risk_level],
                              ['Decision', result.loan_decision?.decision],
                              ['DSCR', `${result.financial_ratios?.dscr}x`],
                              ['Debt/Equity', `${result.financial_ratios?.debt_to_equity}x`],
                         ].map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2d45' }}>
                                   <span style={{ fontSize: '12px', color: '#7b90b0' }}>{k}</span>
                                   <span style={{ fontSize: '13px', color: '#e8edf5', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{v}</span>
                              </div>
                         ))}
                    </div>

                    {/* Download */}
                    <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                         <div style={{ fontWeight: 700, fontSize: '16px', color: '#e8edf5', marginBottom: '4px' }}>Generate & Download</div>

                         {!camGenerated ? (
                              <button className="btn-cyan" style={{ width: '100%', padding: '14px' }}
                                   onClick={handleGenerate} disabled={generating}>
                                   {generating ? '⏳ Generating...' : '📄 Generate CAM Report'}
                              </button>
                         ) : (
                              <>
                                   <div style={{ background: '#00ff8715', border: '1px solid #00ff8740', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#00ff87' }}>
                                        ✅ CAM Ready – {caseId}
                                   </div>
                                   {['docx', 'pdf', 'json'].map(fmt => (
                                        <button key={fmt} className="btn-ghost"
                                             style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
                                             onClick={() => handleDownload(fmt)}
                                             disabled={downloadingFmt === fmt}>
                                             <Download size={14} />
                                             {downloadingFmt === fmt ? `Generating ${fmt.toUpperCase()}...` : `Download ${fmt.toUpperCase()}`}
                                        </button>
                                   ))}
                              </>
                         )}

                         {errorMsg && (
                              <div style={{ background: '#ffaa0015', border: '1px solid #ffaa0040', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#ffaa00', lineHeight: 1.5 }}>
                                   ⚠ {errorMsg}
                              </div>
                         )}

                         <div style={{ fontSize: '11px', color: '#3d5272', lineHeight: 1.6 }}>
                              Each download button generates the report live and saves it to your browser as a file. Backend must be running.
                         </div>
                    </div>
               </div>
          </div>
     )
}


// ─── Early Warning ────────────────────────────────────────────────────────────
function EarlyWarningModule({ result }) {
     const warnings = [
          { severity: 'critical', label: 'DRT Notice Active', detail: 'OA 142/2025 – Punjab National Bank. ₹4.2 Cr recovery pending. Hearing: 28 Feb 2026.' },
          { severity: 'high', label: 'Circular GST Transactions', detail: '2 confirmed loops. ₹32.6 Cr inflated revenue. GSTR-2A mismatch 24.7%.' },
          { severity: 'medium', label: 'DSCR Below Threshold', detail: `DSCR ${result.financial_ratios?.dscr}x vs 1.5x minimum. Risk of default escalation.` },
          { severity: 'low', label: 'Sector Macro Risk', detail: 'Steel MSME facing headwinds: margin compression, cheap imports, elevated coal prices.' },
          { severity: 'info', label: 'Monthly EWS Monitoring Required', detail: 'Conditions: Quarterly financials, DSCR report, CAM renewal every 12 months.' },
     ]
     const colors = { critical: '#ff3366', high: '#ff6633', medium: '#ffaa00', low: '#7b90b0', info: '#00d4ff' }
     return (
          <div className="fade-in">
               <ModuleHeader num="M08" title="Early Warning System" subtitle="Continuous monitoring triggers and risk alerts" />
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {warnings.map((w, i) => (
                         <div key={i} className="glass-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${colors[w.severity]}`, display: 'flex', gap: '16px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[w.severity], flexShrink: 0, marginTop: '6px', boxShadow: `0 0 8px ${colors[w.severity]}` }} />
                              <div>
                                   <div style={{ fontWeight: 700, fontSize: '14px', color: '#e8edf5', marginBottom: '4px' }}>{w.label}</div>
                                   <div style={{ fontSize: '12px', color: '#7b90b0', lineHeight: 1.6 }}>{w.detail}</div>
                              </div>
                              <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, color: colors[w.severity], textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, alignSelf: 'flex-start' }}>
                                   {w.severity}
                              </span>
                         </div>
                    ))}
               </div>
          </div>
     )
}

// ─── AI Chatbot Module (Real LLM via /chat API) ──────────────────────────────
function ChatbotModule({ result }) {
     const [messages, setMessages] = useState([{
          role: 'assistant',
          content: `Hello! I'm SHIELD AI — your intelligent credit analyst for **${result.company}** (${result.case_id}).\n\nI'm powered by **Llama 3.3-70B via Groq** and have full context on all 14 documents, financial ratios, fraud analysis, circular trading evidence, and risk scores for this case.\n\nAsk me anything — ratios, DSCR, circular trading loops, DRT notice, collateral, conditions, sector outlook, or the full CAM summary. What would you like to know?`,
          source: 'system',
     }])
     const [input, setInput] = useState('')
     const [isTyping, setIsTyping] = useState(false)
     const inputRef = useRef('')        // always holds latest typed value
     const messagesEndRef = useRef(null)

     // Keep ref in sync with state
     const handleInputChange = (e) => {
          setInput(e.target.value)
          inputRef.current = e.target.value
     }

     // Scroll to bottom when new message arrives
     useEffect(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
     }, [messages, isTyping])

     const QUICK = [
          'What are the top risks in this case?',
          'Explain the circular trading evidence',
          'Why was only ₹10 Cr approved?',
          'Is this DSCR ratio adequate?',
          'Tell me about the DRT legal notice',
          'Give me the full CAM executive summary',
          'What are the pre-disbursement conditions?',
          'Who is the promoter? Any concerns?',
          'How does this compare to industry benchmarks?',
          'Explain the SHIELD score breakdown',
          'What are the fraud flags found?',
          'What should the bank do next?',
     ]

     // Read current value from ref so no stale closure
     const send = async (textArg) => {
          const text = (textArg !== undefined ? textArg : inputRef.current).trim()
          if (!text || isTyping) return
          setInput('')
          inputRef.current = ''
          setIsTyping(true)

          setMessages(prev => [...prev, { role: 'user', content: text }])

          // Build last-10 history for API
          const historyForApi = messages
               .filter(m => m.source !== 'system')
               .slice(-10)
               .map(m => ({ role: m.role, content: m.content }))

          try {
               const res = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         message: text,
                         history: historyForApi,
                         case_context: result,
                    }),
               })
               if (!res.ok) throw new Error(`HTTP ${res.status}`)
               const data = await res.json()
               setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.reply,
                    source: data.source || 'api',
               }])
          } catch (err) {
               setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: buildLocalFallback(text, result),
                    source: 'offline-fallback',
               }])
          } finally {
               setIsTyping(false)
          }
     }

     return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
               {/* Header */}
               <div style={{ marginBottom: '12px', flexShrink: 0 }}>
                    <div style={{ fontSize: '9px', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>MODULE 09</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                         <h2 style={{ fontWeight: 800, fontSize: '26px', color: '#e8edf5', fontFamily: 'Space Grotesk', margin: 0 }}>AI Credit Intelligence Chatbot</h2>
                         <span style={{ fontSize: '10px', background: '#00d4ff20', color: '#00d4ff', border: '1px solid #00d4ff40', borderRadius: '12px', padding: '3px 10px', fontWeight: 700 }}>
                              GROQ · Llama 3.3-70B
                         </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#7b90b0', fontStyle: 'italic', margin: '4px 0 0' }}>
                         Full case context injected · Multi-turn conversation · Evidence-grounded answers
                    </p>
               </div>

               {/* Messages */}
               <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map((m, i) => (
                         <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                              {m.role === 'assistant' && (
                                   <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1d6ff3, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 800, color: 'white' }}>S</div>
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                   <div className="chat-bubble" style={{
                                        background: m.role === 'user' ? '#1d6ff330' : '#111c30',
                                        borderColor: m.role === 'user' ? '#1d6ff350' : '#1e2d45',
                                        whiteSpace: 'pre-line',
                                        fontSize: '13px',
                                        lineHeight: 1.7,
                                   }}>
                                        {m.content}
                                   </div>
                                   {m.source && m.role === 'assistant' && (
                                        <span style={{ fontSize: '9px', color: '#3d5272', marginTop: '3px', fontWeight: 600 }}>
                                             {m.source === 'groq-llama3' ? '⚡ Groq · Llama 3.3-70B' :
                                                  m.source === 'rule-engine' ? '🔧 Rule Engine' :
                                                       m.source === 'offline-fallback' ? '📴 Offline — start backend for full AI' : ''}
                                        </span>
                                   )}
                              </div>
                         </div>
                    ))}

                    {isTyping && (
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1d6ff3, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 800, color: 'white' }}>S</div>
                              <div className="chat-bubble" style={{ background: '#111c30', borderColor: '#1e2d45', padding: '14px 18px' }}>
                                   <span style={{ color: '#00d4ff', fontSize: '20px', letterSpacing: '6px' }}>•••</span>
                              </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
               </div>

               {/* Quick Chips */}
               <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', flexShrink: 0 }}>
                    {QUICK.map(q => (
                         <button key={q} className="btn-ghost"
                              style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px' }}
                              onClick={() => send(q)}>
                              {q}
                         </button>
                    ))}
               </div>

               {/* Input */}
               <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <input
                         className="shield-input"
                         placeholder="Ask anything about this credit appraisal..."
                         value={input}
                         onChange={handleInputChange}
                         onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                         disabled={isTyping}
                         style={{ fontSize: '14px' }}
                    />
                    <button className="btn-cyan" style={{ padding: '10px 22px', flexShrink: 0 }}
                         onClick={() => send()} disabled={isTyping}>
                         {isTyping ? '...' : 'Send →'}
                    </button>
               </div>
          </div>
     )
}


// Minimal offline fallback for when backend is completely unreachable
function buildLocalFallback(q, result) {
     const ql = q.toLowerCase()
     const r = result.financial_ratios || {}
     const risk = result.risk_assessment || {}
     const decision = result.loan_decision || {}
     const company = result.company || 'the company'

     if (/dscr|debt.?service/.test(ql))
          return `DSCR for ${company}: ${r.dscr ?? 1.18}x\n\nMinimum required: 1.5x (BELOW THRESHOLD)\nAdjusted DSCR after circular trading correction: ~0.94x\n\n⚠ Start the backend (uvicorn main:app) for full Groq AI responses.`
     if (/circular|loop|gst/.test(ql))
          return `Circular Trading: ${result.circular_trading?.cycle_count ?? 2} confirmed loops detected via NetworkX.\nGSTR-2A/3B gap: 24.7%. Estimated circular flows: ₹32.6 Cr.\n\n⚠ Start the backend for full LLM-powered analysis.`
     if (/risk|score|shield/.test(ql))
          return `SHIELD Score: ${risk.shield_score ?? 42}/100 (${risk.risk_level ?? 'HIGH'} RISK)\nDefault Probability: ${((risk.default_probability ?? 0.58) * 100).toFixed(1)}%\n\n⚠ Start the backend (uvicorn main:app) for Groq AI-powered insights.`
     if (/decision|approv|sanction/.test(ql))
          return `Decision: ${decision.decision ?? 'CONDITIONAL APPROVAL'}\nApproved: ₹${result.loan_amount_approved ?? 10} Cr of ₹${result.loan_amount_requested ?? 18} Cr requested.\n\nReasons:\n${(decision.reasons || ['DSCR below threshold', 'Circular trading detected']).map(r => `• ${r}`).join('\n')}\n\n⚠ Start the backend for full LLM analysis.`

     return `⚠ Backend Offline – Start with: uvicorn main:app --reload (in /backend)\n\nFor full ChatGPT-style answers powered by Groq Llama 3.3-70B, the backend must be running.\n\nQuick facts:\n• ${company} | Score: ${risk.shield_score ?? 42}/100 | ${risk.risk_level ?? 'HIGH'} RISK\n• Decision: ${decision.decision ?? 'CONDITIONAL APPROVAL'} – ₹${result.loan_amount_approved ?? 10} Cr\n• DSCR: ${r.dscr ?? 1.18}x (below 1.5x minimum)`
}




// ─── Shared Components ────────────────────────────────────────────────────────
function ModuleHeader({ num, title, subtitle }) {
     return (
          <div style={{ marginBottom: '24px' }}>
               <div style={{ fontSize: '9px', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {num}
               </div>
               <h2 style={{ fontWeight: 800, fontSize: '28px', color: '#e8edf5', marginBottom: '6px', fontFamily: 'Space Grotesk' }}>{title}</h2>
               <p style={{ fontSize: '13px', color: '#7b90b0' }}>{subtitle}</p>
          </div>
     )
}

function MetricCard({ label, subLabel, value, color }) {
     return (
          <div className="metric-card">
               <div style={{ fontSize: '9px', color: '#3d5272', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</div>
               <div style={{ fontWeight: 900, fontSize: '28px', color, fontFamily: 'Space Grotesk', marginBottom: '4px' }}>{value}</div>
               <div style={{ fontSize: '10px', color: '#7b90b0' }}>{subLabel}</div>
          </div>
     )
}

function RiskFlag({ type, icon, title, desc }) {
     const colors = { critical: '#ff3366', warning: '#ffaa00', info: '#00d4ff', success: '#00ff87' }
     const color = colors[type] || '#7b90b0'
     return (
          <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '8px', padding: '12px 14px' }}>
               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <span>{icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '12px', color }}>{title}</span>
               </div>
               <p style={{ fontSize: '11px', color: '#7b90b0', margin: 0, lineHeight: 1.5, paddingLeft: '22px' }}>{desc}</p>
          </div>
     )
}

function StatBadge({ label, value, color }) {
     return (
          <div style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
               <div style={{ fontWeight: 800, fontSize: '24px', color, fontFamily: 'Space Grotesk' }}>{value}</div>
               <div style={{ fontSize: '10px', color: '#7b90b0', marginTop: '2px' }}>{label}</div>
          </div>
     )
}

// ─── Demo Fallback Data ───────────────────────────────────────────────────────
const DEMO_RESULT = {
     case_id: 'CAM-2026-0342',
     company: 'Arvind Steel & Alloys Pvt. Ltd.',
     loan_amount_requested: 18,
     loan_amount_approved: 10,
     financial_ratios: { debt_to_equity: 0.65, current_ratio: 7.8, profit_margin: 0.23, dscr: 1.18 },
     fraud_analysis: { anomaly_detected: false, flags: ['Abnormal GSTR-2A/3B gap: 24.7%'], anomaly_score: 0.24 },
     circular_trading: { fraud_detected: true, cycle_count: 2, cycles: [['Arvind Steel', 'Shell Co A', 'Shell Co B', 'Arvind Steel']], graph: { nodes: [{ id: 'Arvind Steel' }, { id: 'Shell Co A' }, { id: 'Shell Co B' }], edges: [{ from: 'Arvind Steel', to: 'Shell Co A' }, { from: 'Shell Co A', to: 'Shell Co B' }, { from: 'Shell Co B', to: 'Arvind Steel' }] } },
     risk_assessment: { shield_score: 42, risk_level: 'HIGH', default_probability: 0.58, risk_color: 'red', breakdown: { document_authenticity: 48, financial_health: 52, circular_trading_fraud: 18, promoter_legal_risk: 30, sector_macro_risk: 55 } },
     loan_decision: { decision: 'CONDITIONAL APPROVAL', reasons: ['DSCR Below Threshold (1.18x) – Minimum 1.5x required', 'Circular Trading Detected via Graph Analysis', 'SHIELD Score Below Threshold (42/100)'], conditions: ['Monthly DSCR monitoring required', 'Additional collateral security required', '4 pre-disbursement conditions to be met'], approved_amount_percentage: 0.55 },
}
