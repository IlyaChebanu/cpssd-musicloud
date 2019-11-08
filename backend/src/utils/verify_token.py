import jwt
import datetime

from ..config import JWT_SECRET
from ..models.auth import get_login


def verify_token(access_token):
    encoded_token = access_token
    access_token = jwt.decode(access_token, JWT_SECRET, algorithms=['HS256'])
    login = get_login(access_token.get("uid"), encoded_token)
    if not login:
        raise ValueError
    time_issued = login[0][2]
    expiry_time = time_issued + datetime.timedelta(days=7)
    now = datetime.datetime.utcnow()
    if (now > expiry_time) or (now < time_issued):
        raise ValueError
    return access_token
