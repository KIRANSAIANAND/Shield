import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShieldLogo from '../components/ShieldLogo'
import { useAppState } from '../context/AppState'
import shieldApi from '../services/api'
import { Upload, X, CheckCircle, Circle, Loader } from 'lucide-react'

const REQUIRED_DOCS = [
     'Balance Sheet', 'GST Returns', 'Bank Statement',
     'ITR Filing', 'MCA / COI', 'Annual Report',
     'Legal Documents', 'P&L Statement', 'Rating Report',
]

const LOAN_TYPES = ['Working Capital', 'Term Loan', 'Working Capital + Term Loan', 'CC Limit', 'Letter of Credit']
const SECTORS = ['Steel Manufacturing – MSME', 'Textile', 'Pharma', 'FMCG', 'IT Services', 'Infrastructure', 'Agriculture', 'Real Estate']

export default function NewCase() {
     const navigate = useNavigate()
     const { caseData, setCaseData, financialData, setFinancialData,
          uploadedDocs, setUploadedDocs, isAnalyzing, setIsAnalyzing, setPipelineResult } = useAppState()

     const [dragOver, setDragOver] = useState(false)
     const [parsedExtract, setParsedExtract] = useState(null)
     const [step, setStep] = useState(1) // 1=details, 2=upload, 3=financials

     const handleDrop = async (e) => {
          e.preventDefault()
          setDragOver(false)
          const files = Array.from(e.dataTransfer?.files || e.target.files)
          for (const file of files) {
               if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                    try {
                         const res = await shieldApi.uploadDocument(file)
                         const parsed = res.data
                         setUploadedDocs(prev => [...prev, { name: file.name, ...parsed }])
                         if (parsed.extracted_financials && Object.keys(parsed.extracted_financials).length > 0) {
                              setParsedExtract(parsed.extracted_financials)
                         }
                    } catch {
                         setUploadedDocs(prev => [...prev, { name: file.name, status: 'uploaded (backend offline – demo mode)' }])
                    }
               }
          }
     }

     const handleRunAnalysis = async () => {
          setIsAnalyzing(true)
          try {
               const payload = {
                    company_name: caseData.company_name,
                    loan_amount_cr: caseData.loan_amount_cr,
                    case_id: caseData.case_id,
                    ...financialData,
               }
               const res = await shieldApi.runPipeline(payload)
               setPipelineResult(res.data)
          } catch (err) {
               // Demo fallback
               setPipelineResult(DEMO_RESULT)
          } finally {
               setIsAnalyzing(false)
               navigate('/dashboard')
          }
     }

     return (
          <div style={{ minHeight: '100vh', background: '#080c14' }}>
               {/* Nav */}
               <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: '1px solid #1e2d45' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                         <ShieldLogo size={28} />
                         <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.08em', color: '#e8edf5' }}>SHIELD</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#7b90b0' }}>New Case Appraisal</span>
               </nav>

               <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontSize: '11px', color: '#3d5272' }}>
                         <span style={{ cursor: 'pointer', color: '#7b90b0' }} onClick={() => navigate('/')}>HOME</span>
                         <span>/</span>
                         <span style={{ color: '#00d4ff', fontWeight: 600 }}>NEW CASE</span>
                         <span>/</span>
                         <span>DOCUMENT UPLOAD</span>
                    </div>

                    <h1 style={{ fontWeight: 900, fontSize: '48px', color: '#e8edf5', fontFamily: 'Space Grotesk', marginBottom: '8px' }}>
                         New Credit Case
                    </h1>
                    <p style={{ color: '#7b90b0', fontSize: '15px', fontStyle: 'italic', marginBottom: '36px' }}>
                         Upload borrower documents and start the AI appraisal pipeline.
                    </p>

                    {/* Borrower Details Card */}
                    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                              <span style={{ fontSize: '18px' }}>📋</span>
                              <span style={{ fontWeight: 700, fontSize: '17px', color: '#e8edf5' }}>Borrower Details</span>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                              <Field label="COMPANY NAME" value={caseData.company_name}
                                   onChange={v => setCaseData(p => ({ ...p, company_name: v }))} />
                              <Field label="CIN / REGISTRATION ID" value={caseData.cin}
                                   onChange={v => setCaseData(p => ({ ...p, cin: v }))} />
                              <Field label="LOAN AMOUNT REQUESTED (₹ CR)" value={caseData.loan_amount_cr} type="number"
                                   onChange={v => setCaseData(p => ({ ...p, loan_amount_cr: parseFloat(v) || 0 }))} />
                              <SelectField label="LOAN TYPE" value={caseData.loan_type} options={LOAN_TYPES}
                                   onChange={v => setCaseData(p => ({ ...p, loan_type: v }))} />
                              <SelectField label="INDUSTRY SECTOR" value={caseData.industry_sector} options={SECTORS}
                                   onChange={v => setCaseData(p => ({ ...p, industry_sector: v }))} />
                              <Field label="PROMOTER NAME" value={caseData.promoter_name}
                                   onChange={v => setCaseData(p => ({ ...p, promoter_name: v }))} />
                         </div>
                    </div>

                    {/* Financial Data Card */}
                    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                         <div style={{ fontWeight: 700, fontSize: '17px', color: '#e8edf5', marginBottom: '20px' }}>
                              📊 Financial Data <span style={{ fontSize: '12px', color: '#7b90b0', fontWeight: 400 }}>(figures in ₹)</span>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                              {[
                                   ['Revenue', 'revenue'], ['EBITDA', 'ebitda'], ['Total Debt', 'total_debt'],
                                   ['Equity', 'equity'], ['Current Assets', 'current_assets'], ['Current Liabilities', 'current_liabilities'],
                                   ['EBIT', 'ebit'], ['Interest Expense', 'interest_expense'], ['Debt Payment', 'debt_payment'],
                              ].map(([label, key]) => (
                                   <Field key={key} label={label.toUpperCase()} value={financialData[key]} type="number"
                                        onChange={v => setFinancialData(p => ({ ...p, [key]: parseFloat(v) || 0 }))} />
                              ))}
                              <div>
                                   <label style={{ fontSize: '9px', color: '#3d5272', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                                        CIRCULAR TRADING FLAG
                                   </label>
                                   <select className="shield-input" value={financialData.circular_trading}
                                        onChange={e => setFinancialData(p => ({ ...p, circular_trading: parseInt(e.target.value) }))}>
                                        <option value={0}>0 – No</option>
                                        <option value={1}>1 – Yes (Detected)</option>
                                   </select>
                              </div>
                              <div>
                                   <label style={{ fontSize: '9px', color: '#3d5272', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                                        NEWS RISK (0-5)
                                   </label>
                                   <input type="range" min={0} max={5} value={financialData.news_risk}
                                        onChange={e => setFinancialData(p => ({ ...p, news_risk: parseInt(e.target.value) }))}
                                        style={{ width: '100%', accentColor: '#00d4ff' }} />
                                   <span style={{ fontSize: '12px', color: '#00d4ff', fontWeight: 600 }}>{financialData.news_risk} / 5</span>
                              </div>
                         </div>
                    </div>

                    {/* Document Upload */}
                    <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                         <div
                              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                              onDragLeave={() => setDragOver(false)}
                              onDrop={handleDrop}
                              onClick={() => document.getElementById('file-input').click()}
                         >
                              <input id="file-input" type="file" multiple accept=".pdf,.txt,.csv" hidden onChange={handleDrop} />
                              <div style={{ fontSize: '36px', marginBottom: '12px' }}>☁</div>
                              <div style={{ fontWeight: 600, fontSize: '16px', color: '#e8edf5', marginBottom: '6px' }}>
                                   Drop files here or click to browse
                              </div>
                              <div style={{ fontSize: '12px', color: '#7b90b0', marginBottom: '14px' }}>
                                   SHIELD auto-classifies your documents using OCR
                              </div>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                   {['PDF', 'XLSX', 'CSV', 'IMAGES'].map(t => (
                                        <span key={t} style={{ fontSize: '10px', background: '#1e2d45', color: '#7b90b0', padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>{t}</span>
                                   ))}
                              </div>
                         </div>

                         {uploadedDocs.length > 0 && (
                              <div style={{ marginTop: '16px' }}>
                                   {uploadedDocs.map((d, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1e2d45' }}>
                                             <CheckCircle size={14} color="#00ff87" />
                                             <span style={{ fontSize: '13px', color: '#e8edf5' }}>{d.name}</span>
                                             <span style={{ fontSize: '11px', color: '#7b90b0', marginLeft: 'auto' }}>{d.total_pages ? `${d.total_pages} pages` : 'Uploaded'}</span>
                                        </div>
                                   ))}
                              </div>
                         )}

                         {/* Document checklist */}
                         <div style={{ marginTop: '24px' }}>
                              <div style={{ fontWeight: 600, fontSize: '15px', color: '#e8edf5', marginBottom: '16px' }}>
                                   Document Checklist – Required for Complete Appraisal
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                   {REQUIRED_DOCS.map(doc => {
                                        const done = uploadedDocs.some(d => d.name.toLowerCase().includes(doc.toLowerCase().split(' ')[0]))
                                        return (
                                             <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: done ? '#00ff87' : '#7b90b0' }}>
                                                  {done ? <CheckCircle size={12} color="#00ff87" /> : <Circle size={12} color="#3d5272" />}
                                                  {doc}
                                             </div>
                                        )
                                   })}
                              </div>
                         </div>
                    </div>

                    {/* Run Analysis Button */}
                    <button
                         onClick={handleRunAnalysis}
                         disabled={isAnalyzing}
                         style={{
                              width: '100%', padding: '18px', fontSize: '16px', fontWeight: 700,
                              background: isAnalyzing ? '#1e2d45' : 'linear-gradient(90deg, #00d4ff, #1d6ff3)',
                              color: '#080c14', border: 'none', borderRadius: '12px', cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                              transition: 'all 0.2s ease', fontFamily: 'Inter',
                              boxShadow: isAnalyzing ? 'none' : '0 4px 30px #00d4ff40',
                         }}
                    >
                         {isAnalyzing ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running SHIELD Analysis...</>
                              : '⚡ Run SHIELD Analysis – 9 AI Modules'}
                    </button>
               </div>
          </div>
     )
}

function Field({ label, value, onChange, type = 'text' }) {
     return (
          <div>
               <label style={{ fontSize: '9px', color: '#3d5272', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                    {label}
               </label>
               <input className="shield-input" type={type} value={value} onChange={e => onChange(e.target.value)} />
          </div>
     )
}

function SelectField({ label, value, onChange, options }) {
     return (
          <div>
               <label style={{ fontSize: '9px', color: '#3d5272', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
                    {label}
               </label>
               <select className="shield-input" value={value} onChange={e => onChange(e.target.value)}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
               </select>
          </div>
     )
}

// Demo fallback result when backend is offline
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
