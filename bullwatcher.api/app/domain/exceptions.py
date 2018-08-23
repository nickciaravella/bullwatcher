class HttpError(Exception):
    def __init__(self, status_code: int, message: str, url: str, response_data: str):
        self.status_code = status_code
        self.message = message
        self.response_data = response_data
        self.url = url
        super().__init__(f'HttpError - status: {status_code} {message}, url: {url}, response: {response_data}')
