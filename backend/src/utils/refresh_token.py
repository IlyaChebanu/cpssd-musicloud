"""
Function for refreshing the timestamp for access_tokens.
"""
import ast
import datetime
import jwt

from cryptography.fernet import Fernet

from ..config import JWT_SECRET, ENCRYPTION_KEY
from ..models.auth import refresh_login, get_login


def refresh_token(access_token):
    """
    Function for refreshing the timestamp for access_tokens.
    :param access_token:
    Str - A raw JWT access_token string.
    :return:
    None - This function updates the Database and returns None.
    """
    encoded_token = access_token

    try:
        if isinstance(access_token, str):
            access_token.encode()
        access_token = jwt.decode(
            access_token, JWT_SECRET, algorithms=['HS256']
        )

        # Decrypt the token contents
        fernet = Fernet(ENCRYPTION_KEY.encode())
        decrypted_contents = fernet.decrypt(access_token['data'].encode())
        contents = ast.literal_eval(decrypted_contents.decode())
        contents["username"] = access_token['username']
        contents["iat"] = access_token['iat']

    except Exception as exc:
        raise exc

    try:
        login = get_login(contents.get("uid"), encoded_token)
    except Exception as exc:
        raise exc

    if not login:
        raise ValueError

    time_issued = login[0][2]
    expiry_time = time_issued + datetime.timedelta(days=7)
    refresh_time = time_issued + datetime.timedelta(days=5)
    now = datetime.datetime.utcnow()
    if refresh_time < now < expiry_time:
        refresh_login(
            datetime.datetime.utcnow(), contents.get("uid"), encoded_token
        )
