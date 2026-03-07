import os
import sys
import shutil
import tempfile
from pathlib import Path
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

# Auth module
from auth import (
    create_user, authenticate_user, get_user_by_id,
    create_token, decode_token
)

# Optional Groq LLM
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

# Load .env from backend directory
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass  # dotenv not installed – use system env vars

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Add models directory to path
sys.path.insert(0, os.path.dirname(__file__))

from models.financial_analyzer import FinancialAnalyzer
from models.fraud_detection_model import FraudDetectionModel
from models.circular_trading_detector import CircularTradingDetector
from models.risk_scoring_model import RiskScoringModel
from models.loan_decision_engine import LoanDecisionEngine
from models.cam_report_generator import CAMReportGenerator
from models.document_parser import DocumentParser

# ---------------------------------------------------------------------------
# Model instances – trained once at startup
# ---------------------------------------------------------------------------
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "shield_models", "company_financial_dataset.csv")
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

fraud_model = FraudDetectionModel()
risk_model = RiskScoringModel()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Train ML models on startup
    try:
        fraud_model.train(DATASET_PATH)
        print("✅ Fraud model trained")
    except Exception as e:
        print(f"⚠️  Fraud model training failed: {e}")
    try:
        risk_model.train(DATASET_PATH)
        print("✅ Risk model trained")
    except Exception as e:
        print(f"⚠️  Risk model training failed: {e}")
    yield


app = FastAPI(
    title="SHIELD Credit Intelligence API",
    description="AI-powered credit decisioning platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class SignupInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class FinancialData(BaseModel):
    company_name: str = "Unknown Company"
    loan_amount_cr: float = 10.0
    case_id: Optional[str] = None
    revenue: float
    ebitda: float
    total_debt: float
    equity: float
    current_assets: float
    current_liabilities: float
    ebit: float
    interest_expense: float
    debt_payment: float
    circular_trading: int = 0   # 0 or 1
    news_risk: int = 2           # 0-5

class FinancialRatiosInput(BaseModel):
    revenue: float
    ebitda: float
    total_debt: float
    equity: float
    current_assets: float
    current_liabilities: float
    ebit: float
    interest_expense: float
    debt_payment: float

class Transaction(BaseModel):
    seller: str
    buyer: str
    amount: float = 0.0

class CircularTradingInput(BaseModel):
    transactions: List[Transaction]

class LoanDecisionInput(BaseModel):
    ratios: dict
    fraud_flag: bool = False
    circular_trading: bool = False
    shield_score: int = 50

class CAMInput(BaseModel):
    company_name: str
    loan_amount_cr: float
    case_id: Optional[str] = None
    ratios: dict
    risk_result: dict
    loan_decision: dict
    fraud_result: Optional[dict] = None
    circular_result: Optional[dict] = None

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatInput(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    case_context: Optional[dict] = None  # full pipeline result


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

# ── Auth ─────────────────────────────────────────────────────────────────

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("/auth/signup")
def signup(data: SignupInput):
    """Create a new account with email + password."""
    if not data.email or "@" not in data.email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    try:
        user = create_user(data.email.strip(), data.name.strip(), data.password)
        token = create_token(user["id"], user["email"])
        return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@app.post("/auth/login")
def login(data: LoginInput):
    """Authenticate with email + password. Returns JWT."""
    user = authenticate_user(data.email.strip(), data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    """Return current user info from JWT."""
    return current_user



@app.get("/health")
def health():
    return {
        "status": "healthy",
        "fraud_model_ready": fraud_model.model is not None,
        "risk_model_ready": risk_model.model is not None,
    }


# --- 1. Document Upload & Parsing ---
@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    allowed_types = ["application/pdf", "text/plain", "text/csv"]
    if file.content_type not in allowed_types and not file.filename.endswith((".pdf", ".txt", ".csv")):
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and CSV files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        parser = DocumentParser()
        result = parser.parse_file(tmp_path)
        return {
            "filename": file.filename,
            "status": "parsed",
            **result
        }
    finally:
        os.unlink(tmp_path)


# --- 2. Financial Analysis ---
@app.post("/financial-analysis")
def financial_analysis(data: FinancialRatiosInput):
    analyzer = FinancialAnalyzer()
    ratios = analyzer.calculate_ratios(
        revenue=data.revenue,
        ebitda=data.ebitda,
        total_debt=data.total_debt,
        equity=data.equity,
        current_assets=data.current_assets,
        current_liabilities=data.current_liabilities,
        ebit=data.ebit,
        interest_expense=data.interest_expense,
        debt_payment=data.debt_payment,
    )
    return {"status": "success", "financial_ratios": ratios}


# --- 3. Fraud Detection ---
@app.post("/fraud-detection")
def fraud_detection(data: FinancialRatiosInput):
    if fraud_model.model is None:
        raise HTTPException(status_code=503, detail="Fraud model not ready. Try again in a moment.")
    result = fraud_model.detect(data.dict())
    return {"status": "success", **result}


# --- 4. Circular Trading Detection ---
@app.post("/circular-trading")
def circular_trading(data: CircularTradingInput):
    detector = CircularTradingDetector()
    txns = [t.dict() for t in data.transactions]
    result = detector.detect(txns)
    return {"status": "success", **result}


# --- 5. Risk Scoring ---
@app.post("/risk-score")
def risk_score(data: FinancialRatiosInput):
    if risk_model.model is None:
        raise HTTPException(status_code=503, detail="Risk model not ready. Try again in a moment.")
    result = risk_model.predict_score(data.dict())
    return {"status": "success", **result}


# --- 6. Loan Decision ---
@app.post("/loan-decision")
def loan_decision(data: LoanDecisionInput):
    engine = LoanDecisionEngine()
    result = engine.evaluate(
        ratios=data.ratios,
        fraud_flag=data.fraud_flag,
        circular_trading=data.circular_trading,
        shield_score=data.shield_score,
    )
    return {"status": "success", **result}


# --- 7. Full Pipeline ---
@app.post("/run-pipeline")
def run_pipeline(data: FinancialData):
    """Run the entire SHIELD analysis pipeline in one shot."""
    company_data = data.dict()

    # Step 1 - Financial Ratios
    analyzer = FinancialAnalyzer()
    ratios = analyzer.calculate_ratios(
        revenue=data.revenue, ebitda=data.ebitda, total_debt=data.total_debt,
        equity=data.equity, current_assets=data.current_assets,
        current_liabilities=data.current_liabilities, ebit=data.ebit,
        interest_expense=data.interest_expense, debt_payment=data.debt_payment,
    )

    # Step 2 - Fraud Detection
    fraud_result = {"anomaly_detected": False, "flags": [], "anomaly_score": 0}
    if fraud_model.model:
        fraud_result = fraud_model.detect(company_data)

    # Step 3 - Circular Trading (sample transactions for demo)
    sample_txns = []
    if data.circular_trading == 1:
        sample_txns = [
            {"seller": data.company_name, "buyer": "Entity A", "amount": data.revenue * 0.1},
            {"seller": "Entity A", "buyer": "Entity B", "amount": data.revenue * 0.08},
            {"seller": "Entity B", "buyer": data.company_name, "amount": data.revenue * 0.09},
        ]
    detector = CircularTradingDetector()
    circular_result = detector.detect(sample_txns)

    # Step 4 - Risk Scoring
    risk_result = {"shield_score": 50, "risk_level": "MEDIUM", "breakdown": {}}
    if risk_model.model:
        risk_result = risk_model.predict_score(company_data)

    # Step 5 - Loan Decision
    engine = LoanDecisionEngine()
    decision = engine.evaluate(
        ratios=ratios,
        fraud_flag=fraud_result["anomaly_detected"],
        circular_trading=circular_result["fraud_detected"],
        shield_score=risk_result["shield_score"],
    )

    # Compute approved amount
    approved_amount = round(data.loan_amount_cr * decision.get("approved_amount_percentage", 1.0), 1)

    return {
        "status": "success",
        "case_id": data.case_id or f"CAM-2026-{hash(data.company_name) % 9999:04d}",
        "company": data.company_name,
        "loan_amount_requested": data.loan_amount_cr,
        "loan_amount_approved": approved_amount,
        "financial_ratios": ratios,
        "fraud_analysis": fraud_result,
        "circular_trading": circular_result,
        "risk_assessment": risk_result,
        "loan_decision": decision,
    }


# --- 8. CAM Report Generation ---
@app.post("/generate-cam")
def generate_cam(data: CAMInput):
    generator = CAMReportGenerator(output_dir=REPORTS_DIR)
    result = generator.generate(
        company_name=data.company_name,
        loan_amount=data.loan_amount_cr,
        ratios=data.ratios,
        risk_result=data.risk_result,
        loan_decision=data.loan_decision,
        fraud_result=data.fraud_result,
        circular_result=data.circular_result,
        case_id=data.case_id,
    )
    return result


# --- 9. Download CAM Report ---
@app.get("/download-cam/{case_id}/{format}")
def download_cam(case_id: str, format: str):
    ext_map = {"docx": "docx", "pdf": "pdf", "json": "json"}
    if format not in ext_map:
        raise HTTPException(status_code=400, detail="Format must be docx, pdf, or json")

    file_path = os.path.join(REPORTS_DIR, f"{case_id}_CAM.{format}")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Report {case_id} not found. Generate it first.")

    media_types = {
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pdf": "application/pdf",
        "json": "application/json",
    }
    return FileResponse(
        file_path,
        media_type=media_types[format],
        filename=f"{case_id}_SHIELD_CAM.{format}",
        headers={"Content-Disposition": f'attachment; filename="{case_id}_SHIELD_CAM.{format}"'},
    )


# --- 10. Generate + Download CAM in one shot ---
@app.post("/generate-download-cam/{format}")
def generate_and_download_cam(data: CAMInput, format: str):
    """Generate CAM and immediately return the file for download."""
    if format not in ["docx", "pdf", "json"]:
        raise HTTPException(status_code=400, detail="Format must be docx, pdf, or json")

    generator = CAMReportGenerator(output_dir=REPORTS_DIR)
    result = generator.generate(
        company_name=data.company_name,
        loan_amount=data.loan_amount_cr,
        ratios=data.ratios,
        risk_result=data.risk_result,
        loan_decision=data.loan_decision,
        fraud_result=data.fraud_result,
        circular_result=data.circular_result,
        case_id=data.case_id,
    )
    case_id = result["case_id"]
    file_path = os.path.join(REPORTS_DIR, f"{case_id}_CAM.{format}")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Report file not created")

    # Build clean filename: CAM_Report_ArvindSteel_CAM-2026-0342.docx
    import re
    clean_company = re.sub(r'[^\w]', '', data.company_name.replace(' ', '_').replace('&', 'and'))
    clean_company = re.sub(r'_+', '_', clean_company).strip('_')
    download_name = f"CAM_Report_{clean_company}_{case_id}.{format}"

    media_types = {
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pdf": "application/pdf",
        "json": "application/json",
    }
    return FileResponse(
        file_path,
        media_type=media_types[format],
        filename=download_name,
        headers={
            "Content-Disposition": f'attachment; filename="{download_name}"',
            "X-Download-Filename": download_name,
            "Access-Control-Expose-Headers": "Content-Disposition, X-Download-Filename",
        },
    )


# --- 11. AI Chatbot (Groq LLM) ---
@app.post("/chat")
def chat(data: ChatInput):
    """Real LLM-powered chatbot grounded on case context."""

    ctx = data.case_context or {}
    ratios = ctx.get("financial_ratios", {})
    risk = ctx.get("risk_assessment", {})
    decision = ctx.get("loan_decision", {})
    fraud = ctx.get("fraud_analysis", {})
    ct = ctx.get("circular_trading", {})
    bd = risk.get("breakdown", {})
    company = ctx.get("company", "Arvind Steel & Alloys Pvt. Ltd.")
    case_id = ctx.get("case_id", "CAM-2026-0342")

    system_prompt = f"""You are SHIELD AI, an expert credit analyst chatbot for an AI-powered credit decisioning platform.
You are currently analysing the credit appraisal for: {company} (Case ID: {case_id}).

Here is the complete analysis data for this case:

COMPANY: {company}
CASE ID: {case_id}
LOAN REQUESTED: Rs.{ctx.get('loan_amount_requested', 18)} Cr
LOAN APPROVED: Rs.{ctx.get('loan_amount_approved', 10)} Cr

FINANCIAL RATIOS:
- Debt-to-Equity Ratio: {ratios.get('debt_to_equity', 0.65)}x
- Current Ratio: {ratios.get('current_ratio', 7.8)}x
- Profit Margin (EBITDA): {ratios.get('profit_margin', 0.23)}
- DSCR (Debt Service Coverage Ratio): {ratios.get('dscr', 1.18)}x (minimum required: 1.5x)

SHIELD RISK SCORE:
- Score: {risk.get('shield_score', 42)}/100
- Risk Level: {risk.get('risk_level', 'HIGH')}
- Default Probability: {risk.get('default_probability', 0.58)}
- 5 Dimension Breakdown:
  * Document Authenticity: {bd.get('document_authenticity', 48)}/100
  * Financial Health: {bd.get('financial_health', 52)}/100
  * Circular Trading/Fraud: {bd.get('circular_trading_fraud', 18)}/100 (LOWEST)
  * Promoter & Legal Risk: {bd.get('promoter_legal_risk', 30)}/100
  * Sector & Macro Risk: {bd.get('sector_macro_risk', 55)}/100

FRAUD ANALYSIS:
- Anomaly Detected: {fraud.get('anomaly_detected', False)}
- Anomaly Score: {fraud.get('anomaly_score', 0.24)}
- Flags: {fraud.get('flags', ['Abnormal GSTR-2A/3B gap: 24.7%'])}

CIRCULAR TRADING:
- Detected: {ct.get('fraud_detected', True)}
- Confirmed Loops: {ct.get('cycle_count', 2)}
- Cycles: {ct.get('cycles', [['Arvind Steel', 'Shell Co A', 'Shell Co B', 'Arvind Steel']])}
- Estimated circular GST flows: Rs.32.6 Cr, GSTR-2A/3B mismatch: 24.7%

LOAN DECISION:
- Decision: {decision.get('decision', 'CONDITIONAL APPROVAL')}
- Reasons: {decision.get('reasons', ['DSCR Below Threshold', 'Circular Trading Detected', 'SHIELD Score below threshold'])}
- Conditions: {decision.get('conditions', ['Monthly DSCR monitoring', 'Additional collateral', 'NOC from PNB required'])}

LEGAL / INTELLIGENCE:
- DRT Notice: Original Application (OA) 142/2025 filed by Punjab National Bank
- Default Amount: Rs.4.2 Crore by Promoter Rajesh Gupta (personal guarantor)
- Hearing: 28 February 2026, Debt Recovery Tribunal, Mumbai
- Sector: Steel Manufacturing MSME
- News Risk Score: 3/5 (steel sector slowdown, coal price hike, Chinese imports)

Your role:
- Answer ANY question the credit analyst asks about this case
- Cite module numbers (M01-M09) and document sources when relevant
- Give specific, data-driven answers using the exact numbers above
- Provide actionable recommendations
- If asked something not covered, be honest but relate it back to the case
- Keep answers concise but thorough
- Use INR (Rs.) currency notation
- You can also explain credit concepts, banking terms, or regulatory aspects if asked"""

    # Build message history
    messages = [{"role": "system", "content": system_prompt}]
    for msg in (data.history or [])[-10:]:  # last 10 messages for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": data.message})

    # Try Groq first
    if GROQ_AVAILABLE and GROQ_API_KEY:
        try:
            client = Groq(api_key=GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.4,
                max_tokens=800,
            )
            reply = completion.choices[0].message.content
            return {"reply": reply, "source": "groq-llama3"}
        except Exception as e:
            print(f"Groq error: {e}")

    # Fallback: smart rule-based response using system prompt context
    return {
        "reply": _rule_fallback(data.message, ctx),
        "source": "rule-engine"
    }


def _rule_fallback(q: str, ctx: dict) -> str:
    """Fallback rule engine when Groq is unavailable."""
    ql = q.lower()
    ratios = ctx.get("financial_ratios", {})
    risk = ctx.get("risk_assessment", {})
    decision = ctx.get("loan_decision", {})
    company = ctx.get("company", "the company")
    score = risk.get("shield_score", 42)
    dscr = ratios.get("dscr", 1.18)
    approved = ctx.get("loan_amount_approved", 10)
    requested = ctx.get("loan_amount_requested", 18)

    if any(w in ql for w in ["shield", "score", "rating"]):
        bd = risk.get("breakdown", {})
        return (f"SHIELD Score for {company}: {score}/100 ({risk.get('risk_level','HIGH')} RISK)\n"
                f"Default Probability: {risk.get('default_probability',0.58)*100:.1f}%\n\n"
                f"Score Breakdown:\n"
                + "\n".join(f"  • {k.replace('_',' ').title()}: {v}/100" for k,v in bd.items()))
    if any(w in ql for w in ["dscr", "debt service", "coverage"]):
        return (f"DSCR = EBIT / (Interest + Debt Payment) = {dscr}x\n"
                f"Minimum required: 1.5x. Status: {'BELOW THRESHOLD' if dscr < 1.5 else 'HEALTHY'}\n"
                f"After adjusting for circular trading inflation: ~0.94x")
    if any(w in ql for w in ["circular", "gst", "loop", "shell"]):
        ct = ctx.get("circular_trading", {})
        return (f"Circular Trading: {ct.get('cycle_count',2)} confirmed loops detected via NetworkX graph analysis.\n"
                f"GSTR-2A/3B mismatch: 24.7%. Circular GST flows: Rs.32.6 Cr estimated.\n"
                f"This reduces effective DSCR from {dscr}x to ~0.94x.")
    if any(w in ql for w in ["drt", "legal", "notice", "pnb", "punjab"]):
        return ("DRT Notice: Original Application OA 142/2025 filed by Punjab National Bank.\n"
                "Default: Rs.4.2 Crore | Guarantor: Rajesh Gupta (Promoter)\n"
                "Tribunal: Debt Recovery Tribunal, Mumbai | Hearing: 28 Feb 2026")
    if any(w in ql for w in ["decision", "approv", "sanction", "reject"]):
        reasons = decision.get("reasons", [])
        return (f"Decision: {decision.get('decision','CONDITIONAL APPROVAL')}\n"
                f"Amount: Rs.{approved} Cr (of Rs.{requested} Cr requested)\n"
                f"Reasons:\n" + "\n".join(f"• {r}" for r in reasons))
    if any(w in ql for w in ["ratio", "financial", "balance"]):
        return (f"Financial Ratios for {company}:\n"
                f"• D/E: {ratios.get('debt_to_equity',0.65)}x\n"
                f"• Current Ratio: {ratios.get('current_ratio',7.8)}x\n"
                f"• EBITDA Margin: {ratios.get('profit_margin',0.23)*100:.1f}%\n"
                f"• DSCR: {dscr}x (below 1.5x threshold)")
    return (f"I'm the SHIELD AI chatbot for {company} (Score: {score}/100, {risk.get('risk_level','HIGH')} RISK).\n"
            f"Decision: {decision.get('decision','CONDITIONAL APPROVAL')} Rs.{approved} Cr.\n"
            f"Ask me about: DSCR, circular trading, DRT notice, SHIELD score, "
            f"financial ratios, loan decision, promoter, collateral, or CAM report.")
