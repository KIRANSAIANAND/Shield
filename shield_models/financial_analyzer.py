class FinancialAnalyzer:

    def calculate_ratios(self, revenue, profit, assets, liabilities, debt):

        debt_to_equity = debt / (assets - liabilities)

        current_ratio = assets / liabilities

        profit_margin = profit / revenue

        return {
            "debt_to_equity": round(debt_to_equity, 2),
            "current_ratio": round(current_ratio, 2),
            "profit_margin": round(profit_margin, 2)
        }