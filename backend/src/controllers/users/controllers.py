import re
import traceback

import mysql.connector
from passlib.hash import argon2
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError

from ...config import HOST
from ...utils.logger import log
from ...utils import random_string, send_mail
from ...models.users import insert_user, get_user, get_user_via_email
from ...models.verification import insert_verification, get_verification

users = Blueprint("users", __name__)


@users.route("/", methods=["POST"])
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
    except ValidationError:
        log("warning", "Request validation failed.", traceback.format_exc())
        return {"message": "Some info is missing from your request."}, 422

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
        uid = int(get_user(request.json.get("username"))[0][0])
        while True:
            try:
                code = random_string(64)
                insert_verification(code, uid)
                break
            except mysql.connector.errors.IntegrityError:
                continue
    except mysql.connector.errors.IntegrityError:
        log("warning", "Attempted to create a duplicate user.", traceback.format_exc())
        return {"message": "User already exists!"}, 400
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
        return {"message": "Verification mail failed to send."}, 500

    return {"message": "User created!"}


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
    except ValidationError:
        log("warning", "Request validation failed.", traceback.format_exc())
        return {"message": "Some info is missing from your request."}, 422

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
        return {"message": "Verification mail failed to send."}, 500

    return {"message": "Verification email sent."}
