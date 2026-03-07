import pdfplumber
import re
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class DocumentParser:

    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.text = ""

    # Extract text from PDF
    def extract_text(self):

        with pdfplumber.open(self.pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    self.text += page_text + "\n"

        return self.text

    # Extract important financial numbers
    def extract_financials(self):

        financial_data = {}

        patterns = {
            "revenue": r"(Revenue|Total Revenue).*?(\d+[,\d]*)",
            "ebitda": r"(EBITDA).*?(\d+[,\d]*)",
            "total_debt": r"(Total Debt|Borrowings).*?(\d+[,\d]*)",
            "net_profit": r"(Net Profit).*?(\d+[,\d]*)"
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, self.text, re.IGNORECASE)

            if match:
                value = match.group(2).replace(",", "")
                financial_data[key] = float(value)

        return financial_data


# Test the parser
if __name__ == "__main__":

    pdf_file = "sample_financial_report.pdf"

    parser = DocumentParser(pdf_file)

    parser.extract_text()

    data = parser.extract_financials()

    print("Extracted Financial Data:")
    print(data)