import pandas as pd
from sklearn.ensemble import IsolationForest


class FraudDetectionModel:

    def train(self, dataset_path):

        df = pd.read_csv(dataset_path)

        X = df[["revenue","profit","expenses","assets","liabilities","debt"]]

        self.model = IsolationForest(contamination=0.1)

        self.model.fit(X)

        return {"status": "Fraud Detection Model Trained"}

    def detect(self, company_data):

        sample = [[
            company_data["revenue"],
            company_data["profit"],
            company_data["expenses"],
            company_data["assets"],
            company_data["liabilities"],
            company_data["debt"]
        ]]

        prediction = self.model.predict(sample)[0]

        if prediction == -1:
            return {"anomaly_detected": True}
        else:
            return {"anomaly_detected": False}