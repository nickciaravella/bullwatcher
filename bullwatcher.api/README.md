# Starting the service
From this directory: `bullwatcher.api`

```
. venv/bin/activate
export FLASK_APP=app
export FLASK_ENV=development
export SQLALCHEMY_DATABASE_URI="postgresql+psycopg2://bullwatcheradmin:{password}@bullwatcherdb-id.cpgc38pxuho0.us-east-2.rds.amazonaws.com:5432/bullwatcherdb"
flask run
```

# Updating the database with new models
https://flask-migrate.readthedocs.io/en/latest/
```
You can then generate an initial migration:

$ flask db migrate
The migration script needs to be reviewed and edited, as Alembic currently does not detect every change you make to your models. In particular, Alembic is currently unable to detect table name changes, column name changes, or anonymously named constraints. A detailed summary of limitations can be found in the Alembic autogenerate documentation. Once finalized, the migration script also needs to be added to version control.

Then you can apply the migration to the database:

$ flask db upgrade
Then each time the database models change repeat the migrate and upgrade commands.

To sync the database in another system just refresh the migrations folder from source control and run the upgrade command.

To see all the commands that are available run this command:

$ flask db --help
Note that the application script must be set in the FLASK_APP environment variable for all the above commands to work, as required by the flask command line script.
```