# validator/services/news_service.py
import requests
from pytrends.request import TrendReq
from django.conf import settings


def get_news_context(idea: str, max_articles: int = 5) -> str:
    """
    NewsAPI se related news fetch

    """
    if not settings.NEWS_API_KEY:
        return ""

    # Idea se keywords nikaalo (first 3 words)
    keywords = " ".join(idea.split()[:4])

    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": keywords,
            "sortBy": "relevancy",
            "pageSize": max_articles,
            "language": "en",
            "apiKey": settings.NEWS_API_KEY,
        }
        res = requests.get(url, params=params, timeout=5)
        articles = res.json().get("articles", [])

        if not articles:
            return ""

        headlines = []
        for a in articles[:max_articles]:
            title = a.get("title", "")
            desc = a.get("description", "")
            if title:
                headlines.append(f"- {title}: {desc[:100] if desc else ''}")

        return "\n".join(headlines)

    except Exception:
        return ""  # News fail ho toh bhi AI kaam karega


def get_trends(idea: str) -> list:
    """
    Google Trends se trend data fetch karo (COMPLETELY FREE)
    pytrends library use hoti hai
    """
    keywords = idea.split()[:2]  # First 2 words
    if not keywords:
        return []

    try:
        pytrends = TrendReq(hl='en-US', tz=330)  # tz=330 for India
        pytrends.build_payload(keywords, timeframe='today 12-m')
        data = pytrends.interest_over_time()

        if data.empty:
            return []

        # Trend direction check karo
        trend_info = []
        for kw in keywords:
            if kw in data.columns:
                recent = data[kw].tail(4).mean()
                older = data[kw].head(4).mean()
                direction = "Rising" if recent > older else "Declining"
                trend_info.append(f"{kw}: {direction} trend (score: {int(recent)}/100)")

        return trend_info

    except Exception:
        return []