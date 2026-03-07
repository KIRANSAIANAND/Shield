import requests


class ResearchAgent:

    def __init__(self, company_name):
        self.company_name = company_name


    def fetch_news(self):

        url = f"https://newsapi.org/v2/everything?q={self.company_name}&language=en&sortBy=publishedAt&apiKey=a25f722f898e414ebfa8437c3e56abab"

        try:
            response = requests.get(url)
            data = response.json()

            articles = []

            for article in data.get("articles", [])[:5]:
                articles.append({
                    "title": article["title"],
                    "source": article["source"]["name"]
                })

            return articles

        except:
            return []


    def analyze_news_risk(self, articles):

        risk_keywords = [
            "fraud",
            "scam",
            "investigation",
            "lawsuit",
            "bankruptcy",
            "default"
        ]

        risk_score = 0

        for article in articles:
            title = article["title"].lower()

            for word in risk_keywords:
                if word in title:
                    risk_score += 1

        return risk_score


# Testing
if __name__ == "__main__":

    company = "Adani"

    agent = ResearchAgent(company)

    news = agent.fetch_news()

    print("Latest News:")
    print(news)

    risk = agent.analyze_news_risk(news)

    print("News Risk Score:", risk)