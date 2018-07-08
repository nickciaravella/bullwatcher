import json
import requests
import time


def get_json(url):
    print('START -- GET ' + url)
    start = time.time()

    data = requests.get(url)
    js = json.loads(data.text)

    end = time.time()
    print('END   -- Time: ' + str(end - start))

    return js
