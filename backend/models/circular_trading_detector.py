import networkx as nx


class CircularTradingDetector:

    def detect(self, transactions: list):
        G = nx.DiGraph()

        for t in transactions:
            seller = t.get("seller", "Unknown")
            buyer = t.get("buyer", "Unknown")
            amount = t.get("amount", 0)
            G.add_edge(seller, buyer, amount=amount)

        cycles = list(nx.simple_cycles(G))

        # Build graph data for visualization
        nodes = [{"id": n, "label": n} for n in G.nodes()]
        edges = [
            {"from": u, "to": v, "amount": G[u][v].get("amount", 0)}
            for u, v in G.edges()
        ]

        return {
            "fraud_detected": len(cycles) > 0,
            "cycle_count": len(cycles),
            "cycles": cycles,
            "graph": {
                "nodes": nodes,
                "edges": edges,
            }
        }
