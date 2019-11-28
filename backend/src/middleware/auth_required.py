import traceback
from functools import wraps

import jwt
from flask import request

from ..utils import verify_and_refresh, log


def auth_required(return_user=False, return_token=False):
    def _auth_required(f):
        @wraps(f)
        def __auth_required(*args, **kwargs):
            if not request.headers.get("Authorization"):
                return {"message": "Request missing access_token."}, 401
            try:
                access_token = request.headers.get("Authorization").split(" ")[1]
            except IndexError:
                return {"message": "Bad access_token."}, 401

            try:
                user = verify_and_refresh(access_token)
            except ValueError:
                return {"message": "Token expired."}, 401
            except jwt.exceptions.InvalidSignatureError:
                return {"message": "Server failed to decode token."}, 500
            except jwt.exceptions.DecodeError:
                return {"message": "Bad access_token."}, 401
            except Exception:
                log("error", "Server Error", traceback.format_exc())
                return {"message": "Something has gone wrong!"}, 500
            if return_user:
                kwargs["user"] = user
            elif return_token:
                kwargs["access_token"] = access_token
            result = f(*args, **kwargs)
            return result
        return __auth_required
    return _auth_required
