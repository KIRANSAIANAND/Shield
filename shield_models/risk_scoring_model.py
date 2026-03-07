import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

class RiskScoringModel:

    def train(self, dataset_path):

        df = pd.read_csv(dataset_path)

        # Create risk label (demo logic)
        df["risk"] = (df["profit"] < 150000).astype(int)

        X = df[["revenue","profit","expenses","assets","liabilities","debt"]]
        y = df["risk"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        model = XGBClassifier()

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        accuracy = accuracy_score(y_test, predictions)

        self.model = model

        return f"Risk Model Trained | Accuracy: {accuracy:.2f}"

    def predict_score(self, company_data):

        prediction = self.model.predict([company_data])[0]

        if prediction == 0:
            score = 80
            risk_level = "LOW"
        else:
            score = 40
            risk_level = "HIGH"

        return {
            "shield_score": score,
            "risk_level": risk_level
        }