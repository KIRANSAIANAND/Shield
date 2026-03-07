import networkx as nx
import matplotlib.pyplot as plt


class CircularTradingDetector:

    def detect(self, transactions):

        G = nx.DiGraph()

        # Add transactions as graph edges
        for t in transactions:
            seller = t["seller"]
            buyer = t["buyer"]
            G.add_edge(seller, buyer)

        # Detect cycles
        cycles = list(nx.simple_cycles(G))

        if cycles:
            return {
                "fraud_detected": True,
                "cycles": cycles
            }
        else:
            return {
                "fraud_detected": False,
                "cycles": []
            }

    def visualize(self, transactions):

        G = nx.DiGraph()

        for t in transactions:
            G.add_edge(t["seller"], t["buyer"])

        nx.draw(G, with_labels=True, node_size=3000, node_color="lightblue")

        plt.title("Transaction Network")

        plt.show()