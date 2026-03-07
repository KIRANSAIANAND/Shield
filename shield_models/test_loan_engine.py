from loan_decision_engine import LoanDecisionEngine

engine = LoanDecisionEngine()

sample_ratios = {
    "debt_to_equity": 1.2,
    "current_ratio": 1.5,
    "profit_margin": 0.12
}

result = engine.evaluate(sample_ratios, fraud_flag=False)

print("Loan Decision Result:")
print(result)