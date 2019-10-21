import datetime
import traceback

import jwt
from flask import Blueprint
from flask import request
from flask import jsonify
from passlib.hash import argon2
from jsonschema import validate, ValidationError

from ...config import JWT_SECRET
from ...utils.logger import log
from ...utils import random_string
from ...models.verification import get_verification_by_code, delete_verification
from ...models.users import verify_user, get_user
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

    response = jsonify({"message": "Verified."})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


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
    except ValidationError:
        log("warning", "Request validation failed.", traceback.format_exc())
        return {"message": "Some info is missing from your request."}, 400

    try:
        user = get_user(request.json.get("username"))
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    if not user:
        return {"message": "Bad login credentials."}, 400

    # Check the user's password against the provided one
    if not argon2.verify(request.json.get("password"), user[0][3]):
        return {"message": "Bad login credentials."}, 400

    # Check the user is verified
    if user[0][4] == 0:
        return {"message": "Account not verified."}, 401

    time_issued = datetime.datetime.now()

    jwt_payload = {
        'uid': user[0][0],
        'email': user[0][1],
        'username': user[0][2],
        'verified': user[0][4],
        'time_issued': str(time_issued),
        'random_value': random_string(255)
    }
    access_token = jwt.encode(jwt_payload, JWT_SECRET, algorithm='HS256')

    try:
        insert_login(user[0][0], access_token.decode('utf-8'), time_issued)
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    response = jsonify({"access_token": access_token})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@auth.route('/logout', methods=["POST"])
def logout():
    expected_body = {
        "type": "object",
        "properties": {
            "access_token": {"type": "string"},
        }
    }
    # Check req body is correctly formed.
    try:
        validate(request.json, schema=expected_body)
    except ValidationError:
        log("error", "Request validation failed.", traceback.format_exc())
        return {"message": "Some info is missing from your request."}, 400

    try:
        delete_login(request.json.get("access_token"))
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    response = jsonify({"message": "User has been successfully logged out!"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
