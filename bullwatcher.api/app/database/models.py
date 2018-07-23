from application import db


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
