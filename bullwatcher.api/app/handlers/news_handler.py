from typing import List, Set

from app.data_access import bullwatcherdb, newsapi
from app.domain.news import News
from app.domain.stocks import StockMetadata


def get_market_news() -> News:
    market_news_keywords: List[str] = [
        "stock",
        "market",
        "nyse",
        "nasdaq",
        "dow",
        "s&p",
        "business"
    ]
    return newsapi.get_news(keywords=market_news_keywords, max_results=10)


def get_stock_news(ticker: str) -> News:
    vague_words: Set[str] = {
        "A",
        "Class",
        "Company",
        "Corporation",
        "Corp.",
        "Inc.",
        "Plc",
        "The",
    }
    keywords: List[str] = []

    stock: StockMetadata = bullwatcherdb.get_stock_metadata(ticker=ticker)
    if stock:
        for word in stock.company_name.split(" "):
            if word not in vague_words:
                keywords.append(word)
    if not keywords:
        for word in stock.sector.split(" "):
            keywords.append(word)

    return newsapi.get_news(keywords=keywords, max_results=10)
