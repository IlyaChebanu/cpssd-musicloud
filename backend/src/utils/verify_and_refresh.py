import traceback

import jwt

from . import verify_token, refresh_token
from .logger import log


def verify_and_refresh(access_token):
    try:
        user = verify_token(access_token)
        refresh_token(access_token)
        return user
    except ValueError:
        return {"message": "Token expired."}, 401
    except jwt.exceptions.InvalidSignatureError:
        return {"message": "Server failed to decode token."}, 500
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503
