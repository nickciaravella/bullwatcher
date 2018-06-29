from app import db


class StockDaily(db.Model):
    date            = db.Column(db.Integer, primary_key=True)
    ticker          = db.Column(db.String(10), primary_key=True)
    low_price       = db.Column(db.Integer)
    high_price      = db.Column(db.Integer)
    open_price      = db.Column(db.Integer)
    close_price     = db.Column(db.Integer)
    volume          = db.Column(db.Integer)
