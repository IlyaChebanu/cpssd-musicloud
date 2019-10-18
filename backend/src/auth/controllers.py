import datetime

import jwt
from flask import Blueprint
from flask import request
from passlib.hash import argon2

from ..config import JWT_SECRET
from ..utils import random_string, verify_req_body, query

auth = Blueprint('auth', __name__)


@auth.route('/verify', methods=["GET"])
def verify():
    # Check the code is a valid length
    code = request.args.get('code')
    if len(code) != 64:
        return {"message": "Invalid code."}, 400

    try:
        # Check the code against the verification table.
        query_1 = (
            "SELECT * FROM Verification "
            "WHERE code = '%s'"
        ) % (
            code
        )
        user = query(query_1, True)
        if not user:
            return {"message": "Invalid code."}, 400

        # Update the user's verification status.
        query_2 = (
            "UPDATE Users "
            "SET verified = 1 "
            "WHERE uid = %d"
        ) % (
            user[0][1]
        )
        query(query_2)

        # Delete the entry in the verification table.
        query_3 = (
            "DELETE FROM Verification "
            "WHERE code = '%s' AND uid = %d"
        ) % (
            code,
            user[0][1]
        )
        query(query_3)
    except Exception:
        return {"message": "MySQL unavailable."}, 503

    return {"message": "Verified."}, 200


@auth.route('/login', methods=["POST"])
def login():
    expected_keys = ["username", "password"]
    # Check req body is correctly formed.
    if not verify_req_body(request.form, expected_keys):
        return {"message": "Bad login credentials."}, 400

    try:
        # Check the code against the verification table.
        query_1 = (
            "SELECT * FROM Users "
            "WHERE username = '%s'"
        ) % (
            request.form.get("username")
        )
        user = query(query_1, True)
    except Exception:
        return {"message": "MySQL unavailable."}, 503

    if not user:
        return {"message": "Bad login credentials."}, 400

    # Check the user's password against the provided one
    if not argon2.verify(request.form.get("password"), user[0][3]):
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
        # Check the code against the verification table.
        query_2 = (
            "INSERT INTO Logins "
            "(uid, access_token, time_issued)"
            "VALUES ('%d', '%s', '%s')"
        ) % (
            user[0][0],
            access_token.decode('utf-8'),
            time_issued
        )
        query(query_2)
    except Exception as e:
        return {"message": "MySQL unavailable."}, 503

    return {"access_token": access_token}, 200


@auth.route('/logout', methods=["POST"])
def logout():
    expected_keys = ["access_token"]
    # Check req body is correctly formed.
    if not verify_req_body(request.form, expected_keys):
        return {"message": "Missing access token."}, 400

    try:
        # Check the code against the verification table.
        query_1 = (
            "DELETE FROM Logins "
            "WHERE access_token = '%s'"
        ) % (
            request.form.get("access_token")
        )
        query(query_1)
    except Exception:
        return {"message": "MySQL unavailable."}, 503

    return {"message": "User has been successfully logged out!"}, 200
