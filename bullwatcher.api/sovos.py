from typing import Dict

import base64
import datetime
import hashlib
import hmac
import requests


class SovosClient:

   def __init__(self):
       self.username: str = 'restuat@LYFT'
       self.password: str = 'Vj39Mnw3'
       self.hmac_key: bytearray = b'd57c3be1-a6d8-492a-bf2e-272f211ee9da'
       self.base_url: str = 'https://sstwsuat.taxware.net:443'

   def get_tax_line_items(self):
       body: Dict[str, any] = {
           "usrname": self.username,
           "pswrd": self.password,
           "isAudit": False,
           "rsltLvl": 5,
           "tdcReqrd": False,
           "currn": "USD",
           "txCalcTp": 1,
           "lines": [
               {
                   "qnty": 7,
                   "trnTp": 5,
                   "grossAmt": 209.0,
                   "orgCd": "LYFT",
                   "goodSrvCd": "2048911",
                   "sTLocCd": "boston_hertz_mcclellan",
                   "custAttrbs": {
                       "RENTAL": "Y",
                       "ENERGY": "Y"
                   }
               }
           ]
       }
       return self._execute_request("/Twe/api/rest/calcTax/doc", body)


   def _datetime_to_iso_8601(self, datetime: datetime.datetime):
       # return '2018-09-04T14:36:50.037-04:00'
       # Using a separate function to emphasize that this is a called out part of the Sovos spec.
       return "%04d-%02d-%02dT%02d:%02d:%02d.000+00:00" % \
              (datetime.year, datetime.month, datetime.day, datetime.hour, datetime.minute, datetime.second)


   def _generate_signature(self,
                           http_method: str,
                           content_type: str,
                           request_datetime: str,
                           resource_path: str) -> str:

       unsigned_string: str = ''.join([http_method,
                                      content_type,
                                      request_datetime,
                                      resource_path,
                                      self.username,
                                      self.password])

       hmac_algo = hmac.new(key=self.hmac_key,
                            msg=unsigned_string.encode('utf-8'),
                            digestmod=hashlib.sha1)

       encoded_string: str = base64.b64encode(hmac_algo.digest()).decode('utf-8')

       return encoded_string


   def _execute_request(self, resource_path: str, body: Dict[str, any]):
       http_method: str = 'POST'
       application_json: str = 'application/json'
       request_datetime: str = self._datetime_to_iso_8601(datetime.datetime.utcnow())
       signature: str = self._generate_signature(http_method=http_method,
                                                 content_type=application_json,
                                                 request_datetime=request_datetime,
                                                 resource_path=resource_path)
       headers: Dict[str, str] = {
           'Content-Type': f'{application_json}',
           'Accept': application_json,
           'Date': request_datetime,
           'Authorization': 'TAX {}:{}'.format(self.username, signature)
       }

       full_url: str = self.base_url + resource_path

       import pprint
       printer = pprint.PrettyPrinter(indent=4)
       print(http_method, full_url)
       printer.pprint(headers)
       print()
       printer.pprint(body)
       print()

       response = requests.request(method=http_method,
                                   url=full_url,
                                   headers=headers,
                                   json=body)
       return response
