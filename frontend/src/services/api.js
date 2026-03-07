import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

export const shieldApi = {
     // Health
     health: () => api.get('/health'),

     // Document upload
     uploadDocument: (file) => {
          const formData = new FormData()
          formData.append('file', file)
          return api.post('/upload-document', formData, {
               headers: { 'Content-Type': 'multipart/form-data' },
          })
     },

     // Financial analysis
     financialAnalysis: (data) => api.post('/financial-analysis', data),

     // Fraud detection
     fraudDetection: (data) => api.post('/fraud-detection', data),

     // Circular trading
     circularTrading: (transactions) =>
          api.post('/circular-trading', { transactions }),

     // Risk scoring
     riskScore: (data) => api.post('/risk-score', data),

     // Loan decision
     loanDecision: (data) => api.post('/loan-decision', data),

     // Full pipeline
     runPipeline: (data) => api.post('/run-pipeline', data),

     // Generate CAM
     generateCAM: (data) => api.post('/generate-cam', data),

     // Download CAM
     downloadCAM: (caseId, format) =>
          `${BASE_URL}/download-cam/${caseId}/${format}`,
}

export default shieldApi
