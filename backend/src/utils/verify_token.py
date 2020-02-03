"""
Function for verifying the validity of the provided access_token.
"""
import ast
import datetime
import jwt

from cryptography.fernet import Fernet

from ..config import JWT_SECRET, ENCRYPTION_KEY
from ..models.auth import get_login


def verify_token(access_token):
    """
    Verify that the provided access_token is valid.
    :param access_token:
    Str - The raw JWT string we want to verify.
    :return:
    Dict - Contains all of the user information encoded in the JWT.
    """
    encoded_token = access_token
    access_token = jwt.decode(access_token, JWT_SECRET, algorithms=['HS256'])

    # Decrypt the token contents
    f = Fernet(ENCRYPTION_KEY.encode())
    decrypted_contents = f.decrypt(access_token['data'].encode())
    contents = ast.literal_eval(decrypted_contents.decode())

    login = get_login(contents.get("uid"), encoded_token)
    if not login:
        raise ValueError
    time_issued = login[0][2]
    expiry_time = time_issued + datetime.timedelta(days=7)
    now = datetime.datetime.utcnow()
    if (now > expiry_time) or (now < time_issued):
        raise ValueError
    return contents
