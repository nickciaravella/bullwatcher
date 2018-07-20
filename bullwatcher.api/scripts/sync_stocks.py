import json
import requests
import time

def _make_request(url):
    print('START -- GET ' + url)
    start = time.time()

    response = requests.get(url)
    data = json.loads(response.text)

    end = time.time()
    print('END   -- Time: ' + str(end - start))
    return data

count = 100
#base = 'http://127.0.0.1:5000'
base = 'http://bullwatcherapi-dev.us-east-1.elasticbeanstalk.com'
data = _make_request(base + '/sync-stocks/' + str(count))
total = count
while data:
    print('Total: ' + str(total))
    data = _make_request(base + '/sync-stocks/' + str(count))
    total += count
