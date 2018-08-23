from typing import Dict

import json
import requests
import time

from app.domain.exceptions import HttpError


def get_json(url):
    print('START -- GET ' + url)
    start = time.time()

    response = requests.get(url)
    raise_on_error(response)

    js = json.loads(response.text)

    end = time.time()
    print('END   -- Time: ' + str(end - start))

    return js


def raise_on_error(response: requests.Response) -> None:
    error_dict: Dict[int, str] = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
    }

    if response.status_code >= 400:
        error_message: str = error_dict[response.status_code] if response.status_code in error_dict else 'Request Failed'
        raise HttpError(
            status_code=response.status_code,
            message=error_message,
            url=response.url,
            response_data=response.text
        )
