import streamlit as st
import pandas as pd

from shield_models.financial_analyzer import FinancialAnalyzer
from shield_models.fraud_detection_model import FraudDetectionModel
from shield_models.risk_scoring_model import RiskScoringModel
from shield_models.loan_decision_engine import LoanDecisionEngine
from shield_models.circular_trading_detector import CircularTradingDetector
from shield_models.cam_report_generator import CAMReportGenerator


st.set_page_config(page_title="SHIELD Credit Intelligence", layout="wide")

st.title("🛡 SHIELD AI Credit Intelligence System")

st.sidebar.title("Navigation")

menu = st.sidebar.selectbox(
    "Select Module",
    [
        "Upload Company Data",
        "Financial Analysis",
        "Fraud Detection",
        "Risk Scoring",
        "Loan Decision",
        "CAM Report"
    ]
)

# Sample company input
company_data = {
    "revenue": 2000000,
    "profit": 200000,
    "expenses": 1800000,
    "assets": 3000000,
    "liabilities": 1500000,
    "debt": 800000
}

if menu == "Upload Company Data":

    st.subheader("Company Financial Data")

    revenue = st.number_input("Revenue", value=2000000)
    profit = st.number_input("Profit", value=200000)
    assets = st.number_input("Assets", value=3000000)
    liabilities = st.number_input("Liabilities", value=1500000)
    debt = st.number_input("Debt", value=800000)

    company_data.update({
        "revenue": revenue,
        "profit": profit,
        "assets": assets,
        "liabilities": liabilities,
        "debt": debt
    })

    st.success("Data Loaded")

if menu == "Financial Analysis":

    analyzer = FinancialAnalyzer()

    ratios = analyzer.calculate_ratios(
        company_data["revenue"],
        company_data["profit"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    )

    st.subheader("Financial Ratios")

    st.json(ratios)

if menu == "Fraud Detection":

    model = FraudDetectionModel()

    model.train("data/sample_dataset.csv")

    result = model.detect(company_data)

    st.subheader("Fraud Detection Result")

    st.json(result)

if menu == "Risk Scoring":

    model = RiskScoringModel()

    model.train("data/sample_dataset.csv")

    vector = [
        company_data["revenue"],
        company_data["profit"],
        company_data["expenses"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    ]

    result = model.predict_score(vector)

    st.subheader("SHIELD Risk Score")

    st.json(result)

if menu == "Loan Decision":

    analyzer = FinancialAnalyzer()

    ratios = analyzer.calculate_ratios(
        company_data["revenue"],
        company_data["profit"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    )

    engine = LoanDecisionEngine()

    decision = engine.evaluate(ratios)

    st.subheader("Loan Decision")

    st.json(decision)

if menu == "CAM Report":

    analyzer = FinancialAnalyzer()

    ratios = analyzer.calculate_ratios(
        company_data["revenue"],
        company_data["profit"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    )

    risk_model = RiskScoringModel()

    risk_model.train("data/sample_dataset.csv")

    vector = [
        company_data["revenue"],
        company_data["profit"],
        company_data["expenses"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    ]

    risk = risk_model.predict_score(vector)

    engine = LoanDecisionEngine()

    decision = engine.evaluate(ratios)

    generator = CAMReportGenerator()

    report = generator.generate(
        "Demo Company",
        ratios,
        risk,
        decision
    )

    st.success("CAM Report Generated")

    st.write(report)