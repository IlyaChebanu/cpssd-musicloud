import datetime
import traceback

import jwt
from flask import Blueprint
from flask import request
from flask import send_file
from passlib.hash import argon2
from jsonschema import validate, ValidationError

from ...config import JWT_SECRET
from ...utils.logger import log
from ...utils import random_string
from ...models.verification import get_verification_by_code, delete_verification
from ...models.users import verify_user, get_user_via_username
from ...models.auth import insert_login, delete_login

auth = Blueprint('auth', __name__)


@auth.route('/verify', methods=["GET"])
def verify():
    code = request.args.get('code')
    if len(code) != 64:
        return {"message": "Invalid code."}, 400

    try:
        user = get_verification_by_code(code)
        if not user:
            return {"message": "Invalid code."}, 400

        verify_user(user[0][1])
        delete_verification(code, user[0][1])
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    return send_file('controllers/auth/success.html'), 200


@auth.route('/login', methods=["POST"])
def login():
    expected_body = {
        "type": "object",
        "properties": {
            "username": {"type": "string"},
            "password": {"type": "string"},
        }
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    try:
        user = get_user_via_username(request.json.get("username"))
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    if not user:
        return {"message": "Bad login credentials."}, 401

    # Check the user's password against the provided one
    if not argon2.verify(request.json.get("password"), user[0][3]):
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
        'random_value': random_string(255)
    }
    access_token = jwt.encode(jwt_payload, JWT_SECRET, algorithm='HS256')

    try:
        insert_login(user[0][0], access_token.decode('utf-8'), time_issued)
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    return {"access_token": access_token.decode('utf-8')}, 200


@auth.route('/logout', methods=["POST"])
def logout():
    access_token = request.headers.get("Authorization").split(" ")[1]
    if not access_token:
        return {"message": "Request missing access_token."}, 422

    try:
        delete_login(access_token)
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    return {"message": "User has been successfully logged out!"}, 200