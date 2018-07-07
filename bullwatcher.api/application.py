import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS


application = Flask(__name__, instance_relative_config=True)
cors = CORS(application, resources={r"*": {"origins": "*"}})

database_uri = os.environ['SQLALCHEMY_DATABASE_URI']
application.config.from_mapping(
    SECRET_KEY='dev',
    SQLALCHEMY_DATABASE_URI=database_uri,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)

# ensure the instance folder exists
try:
    os.makedirs(application.instance_path)
except OSError:
    pass

db = SQLAlchemy(application)
import app.database.models

migrate = Migrate(application, db)

from app import routes
routes.setup_routes(application)

if __name__ == "__main__":
    application.debug = True
    application.run()
