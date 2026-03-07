import networkx as nx


class FraudDetector:

    def __init__(self, transactions):
        """
        transactions = list of dictionaries
        Example:
        [
            {"seller": "A", "buyer": "B", "amount": 100000},
            {"seller": "B", "buyer": "C", "amount": 80000},
            {"seller": "C", "buyer": "A", "amount": 70000}
        ]
        """
        self.transactions = transactions
        self.graph = nx.DiGraph()

    def build_transaction_graph(self):

        for t in self.transactions:
            seller = t["seller"]
            buyer = t["buyer"]
            amount = t["amount"]

            self.graph.add_edge(seller, buyer, amount=amount)

    def detect_circular_trading(self):

        cycles = list(nx.simple_cycles(self.graph))

        return cycles


# Testing
if __name__ == "__main__":

    transactions = [
        {"seller": "CompanyA", "buyer": "CompanyB", "amount": 100000},
        {"seller": "CompanyB", "buyer": "CompanyC", "amount": 90000},
        {"seller": "CompanyC", "buyer": "CompanyA", "amount": 80000},
        {"seller": "CompanyD", "buyer": "CompanyE", "amount": 50000}
    ]

    detector = FraudDetector(transactions)

    detector.build_transaction_graph()

    cycles = detector.detect_circular_trading()

    print("Circular Trading Detected:")
    print(cycles)