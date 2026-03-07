import pandas as pd
import random

companies = []
num_companies = 500

for i in range(num_companies):

    revenue = random.randint(50_000_000, 500_000_000)
    ebitda = revenue * random.uniform(0.05, 0.25)

    total_debt = random.randint(10_000_000, 200_000_000)
    equity = random.randint(20_000_000, 150_000_000)

    current_assets = random.randint(10_000_000, 100_000_000)
    current_liabilities = random.randint(5_000_000, 80_000_000)

    ebit = ebitda * random.uniform(0.7, 0.9)

    interest_expense = random.randint(1_000_000, 10_000_000)

    debt_payment = random.randint(2_000_000, 20_000_000)

    circular_trading = random.choice([0, 1])

    news_risk = random.randint(0, 5)

    loan_default = random.choice([0, 1])

    company = f"Company_{i+1}"

    companies.append([
        company,
        revenue,
        int(ebitda),
        total_debt,
        equity,
        current_assets,
        current_liabilities,
        int(ebit),
        interest_expense,
        debt_payment,
        circular_trading,
        news_risk,
        loan_default
    ])


columns = [
    "company",
    "revenue",
    "ebitda",
    "total_debt",
    "equity",
    "current_assets",
    "current_liabilities",
    "ebit",
    "interest_expense",
    "debt_payment",
    "circular_trading",
    "news_risk",
    "loan_default"
]

df = pd.DataFrame(companies, columns=columns)

df.to_csv("company_financial_dataset.csv", index=False)

print("Dataset generated successfully!")
print("Total companies:", len(df))