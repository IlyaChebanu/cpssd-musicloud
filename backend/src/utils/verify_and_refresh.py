from . import verify_token, refresh_token


def verify_and_refresh(access_token):
    user = verify_token(access_token)
    refresh_token(access_token)
    return user
