class LoanDecisionEngine:

    def evaluate(self, ratios: dict, fraud_flag: bool = False,
                 circular_trading: bool = False, shield_score: int = 50):

        decision = "APPROVE"
        reasons = []
        conditions = []

        # Debt to Equity Check
        if ratios.get("debt_to_equity", 0) > 3:
            decision = "REJECT"
            reasons.append("Extreme Debt to Equity Ratio (>3x)")
        elif ratios.get("debt_to_equity", 0) > 2:
            if decision == "APPROVE":
                decision = "CONDITIONAL APPROVAL"
            reasons.append("High Debt to Equity Ratio (>2x)")

        # Current Ratio Check
        if ratios.get("current_ratio", 0) < 1:
            if decision == "APPROVE":
                decision = "MANUAL REVIEW"
            reasons.append("Low Liquidity - Current Ratio < 1")

        # Profit Margin Check
        if ratios.get("profit_margin", 0) < 0.05:
            if decision == "APPROVE":
                decision = "MANUAL REVIEW"
            reasons.append("Low Profitability - Margin < 5%")

        # DSCR Check
        dscr = ratios.get("dscr", 0)
        if dscr < 1.0:
            decision = "REJECT"
            reasons.append(f"DSCR Critical ({dscr}x) - Below Minimum 1.0x")
        elif dscr < 1.5:
            if decision == "APPROVE":
                decision = "CONDITIONAL APPROVAL"
            reasons.append(f"DSCR Below Threshold ({dscr}x) - Minimum 1.5x required")
            conditions.append("Monthly DSCR monitoring required")

        # Fraud Detection
        if fraud_flag:
            decision = "REJECT"
            reasons.append("Fraud / Anomalous Financial Pattern Detected")

        # Circular Trading
        if circular_trading:
            decision = "REJECT"
            reasons.append("Circular Trading Detected via Graph Analysis")

        # SHIELD Score
        if shield_score < 30:
            decision = "REJECT"
            reasons.append(f"SHIELD Score Critically Low ({shield_score}/100)")
        elif shield_score < 50:
            if decision == "APPROVE":
                decision = "CONDITIONAL APPROVAL"
            reasons.append(f"SHIELD Score Below Threshold ({shield_score}/100)")
            conditions.append("Additional collateral security required")

        # Determine approved amount (if conditional/approved)
        approved_amount_pct = 1.0
        if decision == "CONDITIONAL APPROVAL":
            approved_amount_pct = 0.55
        elif decision == "MANUAL REVIEW":
            approved_amount_pct = 0.7

        return {
            "decision": decision,
            "reasons": reasons,
            "conditions": conditions,
            "approved_amount_percentage": approved_amount_pct,
        }
