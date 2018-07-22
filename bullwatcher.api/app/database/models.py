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
