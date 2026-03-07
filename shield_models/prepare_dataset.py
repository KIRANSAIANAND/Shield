"""
SHIELD Dataset Preparation Script
==================================
Converts the Kaggle 'Credit Risk Dataset' (credit_risk_dataset.csv)
into the format required by SHIELD's ML models.

Kaggle dataset columns:
  person_age, person_income, person_home_ownership, person_emp_length,
  loan_intent, loan_grade, loan_amnt, loan_int_rate, loan_status,
  loan_percent_income, cb_person_default_on_file, cb_person_cred_hist_length

SHIELD required columns:
  company, revenue, ebitda, total_debt, equity,
  current_assets, current_liabilities, ebit,
  interest_expense, debt_payment,
  circular_trading (0/1), news_risk (0-5), loan_default (0/1)

Run:
  python shield_models/prepare_dataset.py
"""

import pandas as pd
import numpy as np
import os

# ── Paths ──────────────────────────────────────────────────────────────────
INPUT_CSV  = os.path.join(os.path.dirname(__file__), "..", "data", "credit_risk_dataset.csv")
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "company_financial_dataset.csv")

# ── Load ───────────────────────────────────────────────────────────────────
print("Loading Kaggle credit risk dataset...")
df = pd.read_csv(INPUT_CSV)
print(f"  Rows: {len(df):,}  |  Columns: {list(df.columns)}")

# ── Drop null rows ─────────────────────────────────────────────────────────
df = df.dropna().reset_index(drop=True)
print(f"  After dropping nulls: {len(df):,} rows")

# ── Column Mapping ─────────────────────────────────────────────────────────
# Scale income from USD to Crore INR (1 USD ≈ 83 INR, 1 Cr = 1e7)
INCOME_TO_CR = 83 / 1e7

out = pd.DataFrame()

# Company name (synthetic)
out["company"] = ["Company_" + str(i+1) for i in range(len(df))]

# Revenue = annual income scaled to Cr
out["revenue"] = (df["person_income"] * INCOME_TO_CR).round(2)

# EBITDA = revenue × profit margin
# Use loan_grade as a proxy for business health (A=30% margin → G=5%)
grade_margin = {"A": 0.30, "B": 0.22, "C": 0.15, "D": 0.10, "E": 0.08, "F": 0.06, "G": 0.05}
margin = df["loan_grade"].map(grade_margin).fillna(0.12)
out["ebitda"] = (out["revenue"] * margin).round(2)

# Total debt = loan amount scaled to Cr
out["total_debt"] = (df["loan_amnt"] * INCOME_TO_CR * 83).round(2)  # loan_amnt is in USD

# Equity = revenue × 1.5 − total_debt (simplified net worth proxy)
out["equity"] = (out["revenue"] * 1.5 - out["total_debt"]).clip(lower=0.5).round(2)

# Current assets = equity × 1.8
out["current_assets"] = (out["equity"] * 1.8).round(2)

# Current liabilities derived from loan_percent_income
out["current_liabilities"] = (
    out["revenue"] * df["loan_percent_income"] * 0.4
).round(2).clip(lower=0.1)

# EBIT = EBITDA × 0.85 (depreciation adjustment)
out["ebit"] = (out["ebitda"] * 0.85).round(2)

# Interest expense = debt × interest rate / 100
out["interest_expense"] = (
    out["total_debt"] * df["loan_int_rate"] / 100
).round(2)

# Debt payment = annual debt repayment (20% of total debt per year)
out["debt_payment"] = (out["total_debt"] * 0.20).round(2)

# Circular trading flag:
# Map cb_person_default_on_file (Y/N) + high interest rate → possible fraud
out["circular_trading"] = (
    (df["cb_person_default_on_file"] == "Y") & (df["loan_int_rate"] > 18)
).astype(int)

# News risk (0–5 scale):
# Derived from loan_grade (A=0 risk → G=5 risk) + years of credit history (inverse)
grade_risk = {"A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 4, "G": 5}
out["news_risk"] = (
    df["loan_grade"].map(grade_risk).fillna(2) +
    (df["cb_person_cred_hist_length"] < 3).astype(int)
).clip(0, 5).astype(int)

# Loan default = loan_status (already 0/1)
out["loan_default"] = df["loan_status"].astype(int)

# ── Sanity check ───────────────────────────────────────────────────────────
print("\nMapped dataset preview:")
print(out.head(5).to_string())
print(f"\nDefault rate: {out['loan_default'].mean()*100:.1f}%")
print(f"Circular trading flagged: {out['circular_trading'].sum()} rows ({out['circular_trading'].mean()*100:.1f}%)")
print(f"SHIELD columns: {list(out.columns)}")

# ── Save ───────────────────────────────────────────────────────────────────
out.to_csv(OUTPUT_CSV, index=False)
print(f"\n✅ Saved {len(out):,} rows to: {OUTPUT_CSV}")
print("   Models will auto-retrain on next backend restart.")
