import jwt
import datetime

from ..config import JWT_SECRET
from ..models.auth import refresh_login, get_login

def refresh_token(access_token):
    encoded_token = access_token

    try:
        if isinstance(access_token, str):
            access_token.encode()
        access_token = jwt.decode(access_token, JWT_SECRET, algorithms=['HS256'])
    except Exception as e:
        raise e

    try:
        login = get_login(access_token.get("uid"), encoded_token)
    except Exception as e:
        raise e

    if not login:
        raise ValueError

    time_issued = login[0][2]
    expiry_time = time_issued + datetime.timedelta(days=7)
    refresh_time = time_issued + datetime.timedelta(days=5)
    now = datetime.datetime.utcnow()
    if refresh_time < now < expiry_time:
        refresh_login(datetime.datetime.utcnow(), access_token.get("uid"), encoded_token)