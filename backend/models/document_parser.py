import pdfplumber
import re
import os


class DocumentParser:

    def __init__(self):
        self.text = ""
        self.pages = []

    def parse_file(self, file_path: str) -> dict:
        """Parse a PDF or text file and extract financial data."""
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            return self._parse_pdf(file_path)
        elif ext in [".txt", ".csv"]:
            return self._parse_text(file_path)
        else:
            return {"error": f"Unsupported file type: {ext}", "text": ""}

    def _parse_pdf(self, pdf_path: str) -> dict:
        self.text = ""
        self.pages = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        self.text += page_text + "\n"
                        self.pages.append({
                            "page": i + 1,
                            "text": page_text[:500]  # preview
                        })
        except Exception as e:
            return {"error": str(e), "text": ""}

        financials = self._extract_financials()
        return {
            "total_pages": len(self.pages),
            "text_preview": self.text[:1000],
            "extracted_financials": financials,
            "raw_text": self.text,
        }

    def _parse_text(self, text_path: str) -> dict:
        with open(text_path, "r", encoding="utf-8", errors="ignore") as f:
            self.text = f.read()
        financials = self._extract_financials()
        return {
            "total_pages": 1,
            "text_preview": self.text[:1000],
            "extracted_financials": financials,
            "raw_text": self.text,
        }

    def _extract_financials(self) -> dict:
        financial_data = {}

        patterns = {
            "revenue": r"(?:Total\s+Revenue|Revenue|Turnover)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "ebitda": r"(?:EBITDA|Operating\s+Profit)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "net_profit": r"(?:Net\s+Profit|PAT)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "total_debt": r"(?:Total\s+Debt|Borrowings|Total\s+Loan)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "equity": r"(?:Equity|Net\s+Worth|Shareholders)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "current_assets": r"(?:Current\s+Assets)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "current_liabilities": r"(?:Current\s+Liabilities)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "ebit": r"(?:EBIT|Operating\s+Income)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
            "interest_expense": r"(?:Interest\s+Expense|Finance\s+Cost)[:\s]+(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d+)?)",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, self.text, re.IGNORECASE)
            if match:
                value = match.group(1).replace(",", "")
                try:
                    financial_data[key] = float(value)
                except ValueError:
                    pass

        return financial_data
