# Starting the service locally
From this directory: `bullwatcher.api`
(TODO make a script)
```
. venv/bin/activate
export FLASK_APP=application
export FLASK_ENV=development
export SQLALCHEMY_DATABASE_URI="postgresql+psycopg2://bullwatcheradmin:{password}@bullwatcherdb-id.cpgc38pxuho0.us-east-2.rds.amazonaws.com:5432/bullwatcherdb"
flask run
```

# Deploying to AWS
From this directory: `bullwatcher.api`

```
eb deploy bullwatcherapi-dev
```
Access the API here: http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com/


# Updating the database with new models
https://flask-migrate.readthedocs.io/en/latest/

1. Run `flask db migrate`
2. Review the changes
3. Run `flask db upgrade`
