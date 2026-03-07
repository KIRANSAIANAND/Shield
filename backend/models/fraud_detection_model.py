import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest


class FraudDetectionModel:

    def __init__(self):
        self.model = None
        self.feature_cols = [
            "revenue", "ebitda", "total_debt", "equity",
            "current_assets", "current_liabilities"
        ]

    def train(self, dataset_path):
        df = pd.read_csv(dataset_path)
        X = df[self.feature_cols]
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.model.fit(X)
        return {"status": "Fraud Detection Model Trained"}

    def detect(self, company_data: dict):
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        sample = [[
            company_data.get("revenue", 0),
            company_data.get("ebitda", 0),
            company_data.get("total_debt", 0),
            company_data.get("equity", 0),
            company_data.get("current_assets", 0),
            company_data.get("current_liabilities", 0),
        ]]

        prediction = self.model.predict(sample)[0]
        score = self.model.score_samples(sample)[0]
        anomaly_score = round(float(-score), 4)

        flags = []
        if prediction == -1:
            flags.append("Anomalous Financial Pattern Detected")
        if company_data.get("total_debt", 0) > company_data.get("equity", 1) * 3:
            flags.append("Extreme Leverage Ratio")
        if company_data.get("ebitda", 0) < company_data.get("revenue", 1) * 0.05:
            flags.append("Abnormally Low EBITDA Margin")

        return {
            "anomaly_detected": bool(prediction == -1),
            "anomaly_score": anomaly_score,
            "flags": flags
        }
