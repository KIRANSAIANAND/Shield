# SHIELD – Smart Holistic Intelligence for Enterprise Lending Decisions

> **Intelli-Credit Hackathon 2026** – AI-powered credit decisioning platform  
> Full-stack: React 18 + FastAPI + Groq Llama 3.3-70B + XGBoost + NetworkX

---

## ✨ Features

| Module | Technology | What It Does |
|--------|-----------|--------------|
| M01 – Document Ingestion | pdfplumber, regex | Parses financial PDFs/TXTs |
| M02 – Financial Analysis | Rule-based | DSCR, D/E ratio, Current Ratio, Margin |
| M03 – NLP Parser | Pattern matching | Extracts key financial terms |
| M04 – Circular Trading | NetworkX graph | Detects GST loop fraud cycles |
| M05 – Intelligence Agent | Rule-based | DRT notices, promoter risk |
| M06 – Risk Scoring | XGBoost (trained on 500 companies) | SHIELD Score 0–100 |
| M07 – CAM Report | python-docx, fpdf2 | Auto-generates DOCX / PDF / JSON |
| M08 – Early Warning | Statistical | Cashflow trend monitoring |
| M09 – AI Chatbot | **Groq Llama 3.3-70B** | Full case-aware Q&A |

---

## 🚀 Quick Start

### 1. Set your Groq API Key

```bash
# Create backend/.env
echo GROQ_API_KEY=your_groq_key_here > backend/.env
```
Get a free key at [console.groq.com](https://console.groq.com)

### 2. Install & Start Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

> On startup: IsolationForest (fraud) + XGBoost (risk) models auto-train on the 500-company dataset.

### 3. Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173**

---

## 📁 Project Structure

```
Shield_credit_intelligence/
├── backend/
│   ├── main.py                        # FastAPI (11 endpoints)
│   ├── .env                           # GROQ_API_KEY (not committed)
│   ├── requirements.txt
│   └── models/
│       ├── financial_analyzer.py      # Ratio calculations
│       ├── fraud_detection_model.py   # IsolationForest
│       ├── circular_trading_detector.py  # NetworkX graph cycles
│       ├── risk_scoring_model.py      # XGBoost SHIELD Score
│       ├── loan_decision_engine.py    # APPROVE/CONDITIONAL/REJECT
│       ├── cam_report_generator.py    # DOCX + PDF + JSON
│       └── document_parser.py        # PDF text extraction
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx            # Hero + live case preview
│       │   ├── NewCase.jsx            # Document upload + form
│       │   └── Dashboard.jsx          # 9-module dashboard
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   └── ShieldLogo.jsx
│       ├── context/AppState.jsx       # Global state
│       └── services/api.js            # Axios wrapper
└── shield_models/
    └── company_financial_dataset.csv  # 500-company training set
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Model status check |
| POST | `/upload-document` | Parse PDF/TXT |
| POST | `/financial-analysis` | Calculate ratios |
| POST | `/fraud-detection` | Anomaly detection |
| POST | `/circular-trading` | Graph cycle detection |
| POST | `/risk-score` | XGBoost SHIELD Score |
| POST | `/loan-decision` | Final credit decision |
| POST | `/run-pipeline` | Full pipeline in one call |
| POST | `/generate-cam` | Generate CAM report |
| POST | `/generate-download-cam/{format}` | Generate + download (docx/pdf/json) |
| POST | `/chat` | Groq Llama 3.3-70B chatbot |

---

## 🤖 AI Chatbot

The chatbot (M09) is powered by **Groq's Llama 3.3-70B** and has full context of the case:
- All financial ratios, fraud flags, circular trading evidence
- Risk scores, loan decision, pre-disbursement conditions
- Supports multi-turn conversation with evidence-grounded answers

Without a Groq API key, it falls back to a smart rule-based engine.

---

## 📊 Dataset Format

To train models on your own data, provide a CSV with:

```
company, revenue, ebitda, total_debt, equity,
current_assets, current_liabilities, ebit,
interest_expense, debt_payment,
circular_trading (0/1), news_risk (0-5), loan_default (0/1)
```

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend not starting | `python -m uvicorn main:app --reload --port 8000` |
| XGBoost error | `pip install xgboost==2.0.3` |
| Chatbot always offline | Check `backend/.env` has valid `GROQ_API_KEY` |
| CAM download fails | Ensure backend is running on port 8000 |

---

## 🏆 Hackathon Context

**Intelli-Credit Challenge 2026** — Category: AI-Powered Credit Intelligence  
Case Study: Arvind Steel & Alloys Pvt. Ltd. – ₹18 Cr loan application  
Outcome: CONDITIONAL APPROVAL – ₹10 Cr (SHIELD Score: 42/100, HIGH RISK)