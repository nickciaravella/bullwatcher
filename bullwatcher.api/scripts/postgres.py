import os
import psycopg2

def query(query):
    pwd = os.environ['POSTGRES_PWD']
    conn = psycopg2.connect(
        host="bullwatcherdb-id.cpgc38pxuho0.us-east-2.rds.amazonaws.com",
        database="bullwatcherdb",
        user="bullwatcheradmin",
        password=pwd,
        port=5432)

    cur = conn.cursor()
    cur.execute(query)
    data = cur.fetchall()
    for tup in data:
        print(tup)
    return data
