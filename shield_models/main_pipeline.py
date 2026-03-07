from financial_analyzer import FinancialAnalyzer
from fraud_detection_model import FraudDetectionModel
from loan_decision_engine import LoanDecisionEngine
from risk_scoring_model import RiskScoringModel
from circular_trading_detector import CircularTradingDetector
from cam_report_generator import CAMReportGenerator


def run_shield_system():

    print("\n----- SHIELD CREDIT INTELLIGENCE SYSTEM -----\n")

    # Sample financial data
    company_data = {
        "revenue": 2000000,
        "profit": 200000,
        "expenses": 1800000,
        "assets": 3000000,
        "liabilities": 1500000,
        "debt": 800000
    }

    # Step 1 Financial Analysis
    analyzer = FinancialAnalyzer()

    ratios = analyzer.calculate_ratios(
        company_data["revenue"],
        company_data["profit"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    )

    print("Financial Ratios:")
    print(ratios)

    # Step 2 Fraud Detection
    fraud_model = FraudDetectionModel()

    fraud_model.train("data/sample_dataset.csv")

    fraud_result = fraud_model.detect(company_data)

    print("\nFraud Detection Result:")
    print(fraud_result)

    # Step 3 Circular Trading Check
    detector = CircularTradingDetector()

    transactions = [
        {"seller": "CompanyA", "buyer": "CompanyB"},
        {"seller": "CompanyB", "buyer": "CompanyC"},
        {"seller": "CompanyC", "buyer": "CompanyA"},
    ]

    circular_result = detector.detect(transactions)

    print("\nCircular Trading Check:")
    print(circular_result)

    # Step 4 Risk Scoring
    risk_model = RiskScoringModel()

    risk_model.train("data/sample_dataset.csv")

    company_vector = [
        company_data["revenue"],
        company_data["profit"],
        company_data["expenses"],
        company_data["assets"],
        company_data["liabilities"],
        company_data["debt"]
    ]

    risk_result = risk_model.predict_score(company_vector)

    print("\nSHIELD Risk Score:")
    print(risk_result)

    # Step 5 Loan Decision
    engine = LoanDecisionEngine()

    decision = engine.evaluate(
        ratios,
        fraud_flag=fraud_result["anomaly_detected"]
    )

    print("\nFinal Loan Decision:")
    print(decision)
    # Step 6 CAM Report Generation

    cam_generator = CAMReportGenerator()

    report = cam_generator.generate(
    company_name="ABC Pvt Ltd",
    ratios=ratios,
    risk_result=risk_result,
    loan_decision=decision
    )

    print("\nCAM Report Generated:")
    print(report)


if __name__ == "__main__":
    run_shield_system()