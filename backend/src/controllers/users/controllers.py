import re
import traceback
import datetime
import random

import jwt
import mysql.connector
from passlib.hash import argon2
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError

from ...config import HOST, RESET_TIMEOUT
from ...utils.logger import log
from ...utils import random_string, send_mail, verify_token, refresh_token
from ...models.users import (
    insert_user, get_user_via_username, get_user_via_email, make_post, create_reset, get_reset_request, delete_reset,
    reset_password, update_reset
)
from ...models.verification import insert_verification, get_verification

users = Blueprint("users", __name__)


@users.route("", methods=["POST"])
def register():
    expected_body = {
        "type": "object",
        "properties": {
            "username": {"type": "string"},
            "email": {"type": "string"},
            "password": {"type": "string"},
        }
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    try:
        password_hash = argon2.hash(request.json.get("password"))
    except Exception:
        log("error", "Failed to hash password", traceback.format_exc())
        return {"message": "Error while hashing password."}, 500

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", request.json.get("email")):
        return {"message": "Invalid email address."}, 400

    try:
        insert_user(request.json.get("email"), request.json.get("username"), password_hash)
        uid = int(get_user_via_username(request.json.get("username"))[0][0])
        while True:
            try:
                code = random_string(64)
                insert_verification(code, uid)
                break
            except mysql.connector.errors.IntegrityError:
                continue
    except mysql.connector.errors.IntegrityError:
        log("warning", "Attempted to create a duplicate user.", traceback.format_exc())
        return {"message": "User already exists!"}, 409
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    sent_from = "dcumusicloud@gmail.com"
    to = request.json.get("email")
    subject = "MusiCloud Email Verification"
    url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
    body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url
    email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (sent_from, to, subject, body)

    try:
        send_mail(sent_from, to, email_text)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "User created!"}, 200


@users.route("/reverify", methods=["POST"])
def reverify():
    expected_body = {
        "type": "object",
        "properties": {
            "email": {"type": "string"},
        }
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", request.json.get("email")):
        return {"message": "Bad request."}, 400

    try:
        user = get_user_via_email(request.json.get("email"))
        if not user:
            return {"message": "Bad request."}, 400
        elif user[0][4] == 1:
            return {"message": "Already verified."}, 403
        code = get_verification(user[0][0])
        if not code:
            while True:
                try:
                    code = random_string(64)
                    insert_verification(code, user[0][0])
                    break
                except mysql.connector.errors.IntegrityError:
                    continue
        else:
            code = code[0][0]
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    sent_from = "dcumusicloud@gmail.com"
    to = request.json.get("email")
    subject = "MusiCloud Email Verification"
    url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
    body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url
    email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (sent_from, to, subject, body)

    try:
        send_mail(sent_from, to, email_text)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "Verification email sent."}, 200


@users.route("/reset", methods=["GET"])
def get_reset():
    email = request.args.get('email')
    if not email:
        return {"message": "Email param can't be empty!"}, 422

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"message": "Bad request."}, 400

    reset_code = random.randint(10000000, 99999999)
    time_issued = datetime.datetime.utcnow()

    try:
        user = get_user_via_email(email)
        if not user:
            return {"message": "Bad request."}, 400
        uid = user[0][0]
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    reset_sent = False
    try:
        create_reset(uid, reset_code, time_issued)
        reset_sent = True
    except mysql.connector.errors.IntegrityError:
        pass
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    if not reset_sent:
        try:
            update_reset(time_issued, reset_code, uid)
        except Exception:
            log("error", "MySQL query failed", traceback.format_exc())
            return {"message": "MySQL unavailable."}, 503

    sent_from = "dcumusicloud@gmail.com"
    to = email
    subject = "MusiCloud Password Reset"
    body = """
    To reset your MusiCloud password, please enter the following code in the forgot password section of our app:\n
    """ + str(reset_code)
    email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
        """ % (sent_from, to, subject, body)

    try:
        send_mail(sent_from, to, email_text)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "Email sent."}, 200


@users.route("/reset", methods=["POST"])
def reset():
    expected_body = {
        "type": "object",
        "properties": {
            "email": {"type": "string"},
            "code": {"type": "integer"},
            "password": {"type": "string"},
        }
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    email = request.json.get("email")
    code = request.json.get("code")

    try:
        password_hash = argon2.hash(request.json.get("password"))
    except Exception:
        log("error", "Failed to hash password", traceback.format_exc())
        return {"message": "Error while hashing password."}, 500

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"message": "Bad request."}, 400

    try:
        user = get_user_via_email(email)
        if not user:
            return {"message": "Bad request."}, 400
        uid = user[0][0]
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    try:
        reset_request = get_reset_request(uid, code)
        if not reset_request:
            return {"message": "Bad request."}, 400
        time_issued = reset_request[0][2]
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    time_expired = time_issued + datetime.timedelta(minutes=RESET_TIMEOUT)
    now = datetime.datetime.utcnow()

    if (now < time_issued) or (now > time_expired):
            return {"message": "The reset code has expired. Please request a new one."}, 401

    try:
        reset_password(uid, password_hash)
        delete_reset(uid)
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    return {"message": "Password reset."}, 200


@users.route("/post", methods=["POST"])
def post():
    expected_body = {
        "type": "object",
        "properties": {
            "access_token": {"type": "string"},
            "message": {"type": "string"},
        }
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    try:
        user = verify_token(request.json.get("access_token"))
        refresh_token(request.json.get("access_token"))
    except ValueError:
        return {"message": "Token expired."}, 401
    except jwt.exceptions.InvalidSignatureError:
        return {"message": "Server failed to decode token."}, 500
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    time_issued = datetime.datetime.utcnow()

    try:
        make_post(user.get("uid"), request.json.get("message"), time_issued)
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    return {"message": "Message posted."}, 200