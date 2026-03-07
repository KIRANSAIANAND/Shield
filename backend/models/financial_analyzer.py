class FinancialAnalyzer:

    def calculate_ratios(self, revenue, ebitda, total_debt, equity,
                         current_assets, current_liabilities,
                         ebit, interest_expense, debt_payment):
        
        # Avoid division by zero
        equity_value = equity if equity != 0 else 1
        current_liabilities_value = current_liabilities if current_liabilities != 0 else 1
        revenue_value = revenue if revenue != 0 else 1
        debt_service = (interest_expense + debt_payment) if (interest_expense + debt_payment) != 0 else 1

        debt_to_equity = round(total_debt / equity_value, 2)
        current_ratio = round(current_assets / current_liabilities_value, 2)
        profit_margin = round(ebitda / revenue_value, 2)
        dscr = round(ebit / debt_service, 2)

        return {
            "debt_to_equity": debt_to_equity,
            "current_ratio": current_ratio,
            "profit_margin": profit_margin,
            "dscr": dscr,
        }
