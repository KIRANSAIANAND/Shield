from risk_scoring_model import RiskScoringModel

model = RiskScoringModel()

print(model.train("data\sample_dataset.csv"))

sample_company = [2000000,200000,1800000,3000000,1500000,800000]

result = model.predict_score(sample_company)

print("Risk Prediction:")
print(result)