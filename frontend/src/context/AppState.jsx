import { createContext, useContext, useState } from 'react'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
     const [caseData, setCaseData] = useState({
          company_name: 'Arvind Steel & Alloys Pvt. Ltd.',
          cin: 'U27100MH2011PTC218432',
          loan_amount_cr: 18,
          loan_type: 'Working Capital + Term Loan',
          industry_sector: 'Steel Manufacturing – MSME',
          promoter_name: 'Rajesh Gupta',
          case_id: 'CAM-2026-0342',
     })

     const [financialData, setFinancialData] = useState({
          revenue: 320671985,
          ebitda: 74152162,
          total_debt: 96227207,
          equity: 149067131,
          current_assets: 92833808,
          current_liabilities: 11899679,
          ebit: 54130545,
          interest_expense: 3161593,
          debt_payment: 2654029,
          circular_trading: 1,
          news_risk: 3,
     })

     const [pipelineResult, setPipelineResult] = useState(null)
     const [uploadedDocs, setUploadedDocs] = useState([])
     const [isAnalyzing, setIsAnalyzing] = useState(false)
     const [camGenerated, setCamGenerated] = useState(false)

     return (
          <AppStateContext.Provider value={{
               caseData, setCaseData,
               financialData, setFinancialData,
               pipelineResult, setPipelineResult,
               uploadedDocs, setUploadedDocs,
               isAnalyzing, setIsAnalyzing,
               camGenerated, setCamGenerated,
          }}>
               {children}
          </AppStateContext.Provider>
     )
}

export function useAppState() {
     const ctx = useContext(AppStateContext)
     if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
     return ctx
}
