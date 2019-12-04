"""
/auth API controller code.
"""
import datetime

import jwt
from flask import Blueprint
from flask import request
from flask import send_file
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jsonschema import validate, ValidationError

from ...config import JWT_SECRET
from ...utils.logger import log
from ...utils import random_string
from ...models.verification import (
    get_verification_by_code, delete_verification
)
from ...models.users import (
    verify_user, get_user_via_username, register_device_for_notifications,
    unregister_device_for_notifications
)
from ...models.auth import insert_login, delete_login
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher

AUTH = Blueprint('auth', __name__)
HASHER = PasswordHasher()


@AUTH.route('/verify', methods=["GET"])
@sql_err_catcher()
def verify():
    """
    Endpoint for verifying a user's email.
    """
    code = request.args.get('code')
    if len(code) != 64:
        return {"message": "Invalid code."}, 400

    user = get_verification_by_code(code)
    verify_user(user[0][1])
    delete_verification(code, user[0][1])

    return send_file('controllers/auth/success.html'), 200


@AUTH.route('/login', methods=["POST"])
@sql_err_catcher()
def login():
    """
    Endpoint for logging in.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "username": {
                "type": "string",
                "minLength": 1
            },
            "password": {
                "type": "string",
                "minLength": 1
            },
            "did": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["username", "password"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    user = get_user_via_username(request.json.get("username"))

    # Check the user's password against the provided one
    try:
        HASHER.verify(user[0][3], request.json.get("password"))
    except VerifyMismatchError:
        return {"message": "Bad login credentials."}, 401

    # Check the user is verified
    if user[0][4] == 0:
        return {"message": "Account not verified."}, 403

    time_issued = datetime.datetime.utcnow()

    jwt_payload = {
        'uid': user[0][0],
        'email': user[0][1],
        'username': user[0][2],
        'verified': user[0][4],
        'profiler': user[0][5],
        'random_value': random_string(255)
    }
    access_token = jwt.encode(jwt_payload, JWT_SECRET, algorithm='HS256')

    insert_login(user[0][0], access_token.decode('utf-8'), time_issued)

    if request.json.get("did"):
        register_device_for_notifications(request.json.get("did"), user[0][0])

    return {"access_token": access_token.decode('utf-8')}, 200


@AUTH.route('/logout', methods=["POST"])
@sql_err_catcher()
@auth_required(return_token_and_user=True)
def logout(user_data, access_token):
    """
    Endpoint for logging out.
    """
    delete_login(access_token)

    if request.json and request.json.get("did"):
        unregister_device_for_notifications(
            str(request.json.get("did")), user_data.get("uid")
        )

    return {"message": "User has been successfully logged out!"}, 200
