"""
Middleware function for verifying a user is logged in.
"""
import traceback
from functools import wraps

import jwt
from flask import request

from ..utils import verify_and_refresh, log


def auth_required(
        return_user=False, return_token=False, return_token_and_user=False
):
    """
    Verify a user is authenticated and refresh there tokens access timer.
    :param return_user:
    Bool - Optional value, if True, the decoded user info is returned.
    :param return_token:
    Bool - Optional value, if True, the raw JWT string is returned.
    :param return_token_and_user:
    Bool - Optional value, if True, the raw JWT string & decoded user info is
    returned.
    :return:
    None/Dict/Str - None if optional params are false, else JWT string if
    return_token == True && return_user == False, else user info dict if
    return_user == True.
    """
    def _auth_required(func):
        @wraps(func)
        def __auth_required(*args, **kwargs):  # pylint:disable=R0911
            if not request.headers.get("Authorization"):
                return {"message": "Request missing access_token."}, 401
            try:
                access_token = request.headers.get(
                    "Authorization"
                ).split(" ")[1]
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
            # Intended to be a general catch all exception.
            except Exception:  # pylint:disable=W0703
                log("error", "Server Error", traceback.format_exc())
                return {"message": "Something has gone wrong!"}, 500
            if return_user:
                kwargs["user_data"] = user
            elif return_token:
                kwargs["access_token"] = access_token
            elif return_token_and_user:
                kwargs["user_data"] = user
                kwargs["access_token"] = access_token
            result = func(*args, **kwargs)
            return result
        return __auth_required
    return _auth_required
