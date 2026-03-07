class CAMGenerator:

    def __init__(self, company_data):
        self.data = company_data


    def generate_character_section(self):

        if self.data["news_risk"] > 2:
            return "Promoter or company has multiple negative news signals."
        else:
            return "No major negative news detected."


    def generate_capacity_section(self):

        if self.data["DSCR"] > 1.5:
            return "Strong repayment capacity."
        else:
            return "Weak repayment capacity."


    def generate_capital_section(self):

        if self.data["Debt_to_Equity"] < 2:
            return "Debt levels appear manageable."
        else:
            return "Debt levels are high."


    def generate_conditions_section(self):

        return "Sector conditions appear stable based on available data."


    def generate_fraud_section(self):

        if self.data["circular_trading"] == 1:
            return "Circular trading risk detected."
        else:
            return "No circular trading detected."


    def generate_recommendation(self):

        if self.data["risk_prediction"] == "Low Risk":
            return {
                "decision": "APPROVE",
                "loan_amount": "₹10 Crore",
                "interest_rate": "11.5%"
            }
        else:
            return {
                "decision": "REJECT",
                "loan_amount": "N/A",
                "interest_rate": "N/A"
            }


    def generate_cam_report(self):

        recommendation = self.generate_recommendation()

        report = f"""
        CREDIT APPRAISAL MEMO
        ---------------------

        Company: {self.data['company']}

        Character
        {self.generate_character_section()}

        Capacity
        {self.generate_capacity_section()}

        Capital
        {self.generate_capital_section()}

        Conditions
        {self.generate_conditions_section()}

        Fraud Risk
        {self.generate_fraud_section()}

        FINAL DECISION
        {recommendation['decision']}

        Suggested Loan Amount: {recommendation['loan_amount']}
        Suggested Interest Rate: {recommendation['interest_rate']}
        """

        return report


# Test the module
if __name__ == "__main__":

    company_data = {
        "company": "ABC Steel",
        "DSCR": 2.25,
        "Debt_to_Equity": 1.5,
        "Current_Ratio": 1.67,
        "Interest_Coverage": 5.0,
        "EBITDA_Margin": 15,
        "news_risk": 1,
        "circular_trading": 0,
        "risk_prediction": "Low Risk"
    }

    cam = CAMGenerator(company_data)

    report = cam.generate_cam_report()

    print(report)