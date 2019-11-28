"""
Function combining token verification and refreshing.
"""
from . import verify_token, refresh_token


def verify_and_refresh(access_token):
    """
    Function to verify & refresh an access_token.
    :param access_token:
    Str - The raw JWT string we want to verify & refresh the DB entry for.
    :return:
    Dict - Contains all of the user information encoded in the JWT.
    """
    user = verify_token(access_token)
    refresh_token(access_token)
    return user
