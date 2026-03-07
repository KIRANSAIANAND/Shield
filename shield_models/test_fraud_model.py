from fraud_detection_model import FraudDetectionModel

model = FraudDetectionModel()

print(model.train("data\sample_dataset.csv"))

company = {
    "revenue": 5000000,
    "profit": 200000,
    "expenses": 4800000,
    "assets": 10000000,
    "liabilities": 7000000,
    "debt": 3000000
}

print(model.predict(company))