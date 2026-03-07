import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


class RiskScoringModel:

    def __init__(self):
        self.model = None
        self.feature_cols = [
            "revenue", "ebitda", "total_debt", "equity",
            "current_assets", "current_liabilities",
            "ebit", "interest_expense", "debt_payment",
            "circular_trading", "news_risk"
        ]

    def train(self, dataset_path):
        df = pd.read_csv(dataset_path)
        X = df[self.feature_cols]
        y = df["loan_default"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric="logloss",
            random_state=42
        )
        self.model.fit(X_train, y_train)

        predictions = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        return {"status": "Risk Model Trained", "accuracy": round(float(accuracy), 3)}

    def predict_score(self, company_data: dict):
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        feature_order = self.feature_cols
        sample = [[company_data.get(col, 0) for col in feature_order]]

        probability = self.model.predict_proba(sample)[0]
        # probability[1] = probability of default (HIGH risk)
        default_prob = float(probability[1])

        # SHIELD Score: 0 = worst, 100 = best
        # High default probability -> Low SHIELD Score
        shield_score = round((1 - default_prob) * 100)

        if shield_score >= 70:
            risk_level = "LOW"
            risk_color = "green"
        elif shield_score >= 45:
            risk_level = "MEDIUM"
            risk_color = "amber"
        else:
            risk_level = "HIGH"
            risk_color = "red"

        # Breakdown scores (weighted components)
        dscr_val = company_data.get("ebit", 0) / max(
            (company_data.get("interest_expense", 1) + company_data.get("debt_payment", 1)), 1
        )
        
        doc_auth = min(100, max(10, int(70 - company_data.get("news_risk", 0) * 5)))
        fin_health = min(100, max(10, int(shield_score * 0.9 + dscr_val * 5)))
        circ_fraud = min(100, max(5, int(100 - company_data.get("circular_trading", 0) * 80)))
        promoter_risk = min(100, max(10, int(60 - company_data.get("news_risk", 0) * 6)))
        sector_macro = min(100, max(20, int(55 + (shield_score - 50) * 0.3)))

        return {
            "shield_score": shield_score,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "default_probability": round(default_prob, 3),
            "breakdown": {
                "document_authenticity": doc_auth,
                "financial_health": fin_health,
                "circular_trading_fraud": circ_fraud,
                "promoter_legal_risk": promoter_risk,
                "sector_macro_risk": sector_macro,
            }
        }
