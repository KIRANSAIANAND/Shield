# SHIELD – Smart Holistic Intelligence for Enterprise Lending Decisions

> **Intelli-Credit Hackathon 2026** – AI-powered credit appraisal platform

---

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

> **Note:** If `xgboost` gives issues on Windows, use: `pip install xgboost --no-cache-dir`

### 2. Start the FastAPI Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

> On startup, the system automatically trains the Fraud Detection and Risk Scoring models on the `company_financial_dataset.csv`.

### 3. Install & Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The React dashboard will be available at **http://localhost:5173**

---

## 📁 Project Structure

```
Shield_credit_intelligence/
├── backend/
│   ├── main.py                    # FastAPI app (9 endpoints)
│   ├── requirements.txt           # Python dependencies
│   ├── reports/                   # Generated CAM reports
│   └── models/
│       ├── financial_analyzer.py  # DSCR, D/E, Current Ratio, Margin
│       ├── fraud_detection_model.py  # IsolationForest anomaly detection
│       ├── circular_trading_detector.py  # NetworkX graph cycles
│       ├── risk_scoring_model.py  # XGBoost SHIELD Score 0-100
│       ├── loan_decision_engine.py  # APPROVE/CONDITIONAL/REJECT
│       ├── cam_report_generator.py  # DOCX + PDF + JSON export
│       └── document_parser.py     # pdfplumber + regex extraction
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Homepage with hero + case card
│   │   │   ├── NewCase.jsx        # Document upload + financial form
│   │   │   └── Dashboard.jsx      # Main dashboard (9 module views)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Pipeline navigation
│   │   │   └── ShieldLogo.jsx     # SVG logo
│   │   ├── context/
│   │   │   └── AppState.jsx       # Global state provider
│   │   └── services/
│   │       └── api.js             # Axios API wrapper
│   └── package.json
└── shield_models/
    └── company_financial_dataset.csv  # 500-company training dataset
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/upload-document` | Parse PDF/TXT files |
| POST | `/financial-analysis` | Calculate ratios (DSCR, D/E, etc.) |
| POST | `/fraud-detection` | IsolationForest anomaly detection |
| POST | `/circular-trading` | NetworkX graph cycle detection |
| POST | `/risk-score` | XGBoost SHIELD Score (0–100) |
| POST | `/loan-decision` | APPROVE / CONDITIONAL / REJECT |
| POST | `/run-pipeline` | Full analysis pipeline in one call |
| POST | `/generate-cam` | Generate CAM report (DOCX/PDF/JSON) |
| GET | `/download-cam/{case_id}/{format}` | Download generated report |

---

## 🎯 Pipeline Flow

```
Upload Documents → Document Parsing → Financial Analysis
→ Fraud Detection → Circular Trading → Risk Scoring
→ Loan Decision → CAM Report Generation
```

---

## 📊 Example Response

```json
{
  "company": "Arvind Steel & Alloys Pvt. Ltd.",
  "shield_score": 42,
  "risk_level": "HIGH",
  "financial_ratios": {
    "dscr": 1.18,
    "debt_to_equity": 0.65,
    "current_ratio": 7.8,
    "profit_margin": 0.23
  },
  "fraud_analysis": {
    "anomaly_detected": false,
    "flags": ["Abnormal GSTR-2A/3B gap: 24.7%"]
  },
  "circular_trading": {
    "fraud_detected": true,
    "cycle_count": 2
  },
  "loan_decision": {
    "decision": "CONDITIONAL APPROVAL",
    "reasons": ["DSCR Below Threshold (1.18x)", "Circular Trading Detected"]
  }
}
```

---

## 🔧 Troubleshooting

- **Backend port conflict**: Change port with `--port 8001` and update `frontend/src/services/api.js`
- **XGBoost error**: Install separately: `pip install xgboost==2.0.3`
- **CORS issues**: Frontend proxies `/api` to backend; ensure backend is on port 8000
- **pdfplumber error**: `pip install pdfplumber Pillow`