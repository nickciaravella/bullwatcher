from application import db


class User(db.Model):
    """
    Table to hold users. The user_id column is the id provided by the identity provider
    prepended with the identity provider itself. For example:
    'google_<id>'
    """
    user_id         = db.Column(db.String(128), primary_key=True)
    email           = db.Column(db.String(512))
    full_name       = db.Column(db.String(512))
    created_date    = db.Column(db.DateTime)


class StockSyncStatus(db.Model):
    ticker          = db.Column(db.String(10), primary_key=True)
    synced_until    = db.Column(db.DateTime)


class StockMetadata(db.Model):
    ticker          = db.Column(db.String(10), primary_key=True)
    company_name    = db.Column(db.String(512), nullable=False)
    market_cap      = db.Column(db.BigInteger)
    sector          = db.Column(db.String(512))


class StockDaily(db.Model):
    date            = db.Column(db.Integer, primary_key=True)
    ticker          = db.Column(db.String(10), primary_key=True)
    low_price       = db.Column(db.Float)
    high_price      = db.Column(db.Float)
    open_price      = db.Column(db.Float)
    close_price     = db.Column(db.Float)
    volume          = db.Column(db.Integer)


class PatternDaily(db.Model):
    '''
    Table which contains all of the tickers that were recognized as a pattern for the day.
    If the ticker is thought to be a pattern, it will have <pattern>_votes set to 0. If not
    <pattern>_votes will remain as None.
    '''
    date            = db.Column(db.Integer, primary_key=True)
    ticker          = db.Column(db.String(10), primary_key=True)
    flag_votes      = db.Column(db.Integer)


class PatternVotesDaily(db.Model):
    """
    Table which tracks which users voted for which patterns. The total counts are cached in the PatternDaily table.
    This is mainly useful for not allowing the same user to vote multiple times on the same pattern.
    """
    date            = db.Column(db.Integer, primary_key=True)
    ticker          = db.Column(db.String(10), primary_key=True)
    user_id         = db.Column(db.String(128), primary_key=True)
    flag_vote       = db.Column(db.Integer)


class StockRanking(db.Model):
    """
    Table which tracks overall rankings of stocks on different time frames.
    """
    ticker          = db.Column(db.String(10), primary_key=True)
    time_window     = db.Column(db.String(5), primary_key=True)
    ranking_type    = db.Column(db.String(48), primary_key=True)
    rank            = db.Column(db.Integer)
    value           = db.Column(db.Float)
    last_updated_at = db.Column(db.DateTime)