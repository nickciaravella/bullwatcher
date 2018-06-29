import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from app import routes


db = SQLAlchemy()
migrate = Migrate()

def create_app(test_config=None):
    flask_app = Flask(__name__, instance_relative_config=True)

    database_uri = os.environ['SQLALCHEMY_DATABASE_URI']
    flask_app.config.from_mapping(
        SECRET_KEY='dev',
        SQLALCHEMY_DATABASE_URI=database_uri,
        SQLALCHEMY_TRACK_MODIFICATIONS=False
    )

    if test_config is None:
        flask_app.config.from_pyfile('config.py', silent=True)
    else:
        flask_app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(flask_app.instance_path)
    except OSError:
        pass

    db.init_app(flask_app)
    import app.database.models

    migrate.init_app(flask_app, db)
    routes.setup_routes(flask_app)

    return flask_app
