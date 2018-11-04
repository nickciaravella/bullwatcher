from typing import Any, List, Optional

import datetime
import dateutil.parser
import os

from app.domain.exceptions import HttpError
from app.domain.news import News, NewsArticle
from newsapi import NewsApiClient


client: Optional[NewsApiClient] = None


def _get_client() -> NewsApiClient:
    global client
    if not client:
        api_key: str = os.environ['NEWSAPI_API_KEY']
        client = NewsApiClient(api_key=api_key)
    return client


def get_news(keywords: List[str], max_results: int) -> News:
    now: datetime.datetime = datetime.datetime.utcnow()
    oldest_date: datetime.datetime = now - datetime.timedelta(days=3)
    response: Any = _get_client().get_everything(q=' '.join(keywords),
                                                 from_param=oldest_date.strftime('%Y-%m-%d'),
                                                 to=now.strftime('%Y-%m-%d'),
                                                 language='en',
                                                 sort_by='relevancy')
    status: str = response['status']
    if status != 'ok':
        raise HttpError(status_code=500,
                        message=f'Request to NewsAPI failed with status {status}',
                        url='NewsAPIClient.get_everything',
                        response_data=response)

    articles: List[NewsArticle] = [
        NewsArticle(article_url=article['url'],
                    description=article['description'],
                    image_url=article['urlToImage'],
                    published_at=dateutil.parser.parse(article['publishedAt']),
                    source=article['source'],
                    title=article['title'])
        for article in response['articles'][:max_results]
    ]

    return News(articles=articles)
