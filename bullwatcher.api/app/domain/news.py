from typing import Dict, List

import datetime


class News:
    def __init__(self, articles: List['NewsArticle']) -> None:
        self.news_articles: List[NewsArticle] = articles

    def to_json(self):
        return {
            'news_articles': [article.to_json() for article in self.news_articles],
        }


class NewsArticle:
    def __init__(self,
                 article_url: str,
                 description: str,
                 image_url: str,
                 published_at: datetime.datetime,
                 source: str,
                 title: str) -> None:
        self.article_url: str = article_url
        self.description: str = description
        self.image_url: str = image_url
        self.published_at: datetime.datetime = published_at
        self.source: str = source
        self.title: str = title

    def to_json(self) -> Dict[str, str]:
        return {
            'article_url': self.article_url,
            'description': self.description,
            'image_url': self.image_url,
            'published_at': str(self.published_at),
            'source': self.source,
            'title': self.title
        }
