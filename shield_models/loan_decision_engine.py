class LoanDecisionEngine:

    def evaluate(self, ratios, fraud_flag=False):

        decision = "APPROVE"
        reasons = []

        # Debt to Equity Check
        if ratios["debt_to_equity"] > 2:
            decision = "REJECT"
            reasons.append("High Debt to Equity Ratio")

        # Current Ratio Check
        if ratios["current_ratio"] < 1:
            decision = "MANUAL REVIEW"
            reasons.append("Low Liquidity")

        # Profit Margin Check
        if ratios["profit_margin"] < 0.05:
            decision = "MANUAL REVIEW"
            reasons.append("Low Profitability")

        # Fraud Detection
        if fraud_flag:
            decision = "REJECT"
            reasons.append("Fraud Risk Detected")

        return {
            "decision": decision,
            "reasons": reasons
        }