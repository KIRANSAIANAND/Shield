from circular_trading_detector import CircularTradingDetector

detector = CircularTradingDetector()

transactions = [
    {"seller": "CompanyA", "buyer": "CompanyB"},
    {"seller": "CompanyB", "buyer": "CompanyC"},
    {"seller": "CompanyC", "buyer": "CompanyA"},
]

result = detector.detect(transactions)

print("Circular Trading Result:")
print(result)

detector.visualize(transactions)