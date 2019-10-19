import re
import traceback

import mysql.connector
from passlib.hash import argon2
from flask import Blueprint
from flask import request

from ..config import GMAIL_CONFIG, HOST
from ..logger.logger import log
from ..utils import random_string, verify_req_body, send_mail, query

users = Blueprint("users", __name__)


@users.route("/", methods=["POST"])
def register():
    expected_keys = ["username", "email", "password"]
    # Check req body is correctly formed.
    if not verify_req_body(request.form, expected_keys):
        return {"message": "Some info is missing from your request."}, 400

    try:
        # Hash the inputted password
        password_hash = argon2.hash(request.form.get("password"))
    except Exception:
        log("error", "Failed to hash password", traceback.format_exc())
        return {"message": "Error while hashing password."}, 500

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", request.form.get("email")):
        return {"message": "Invalid email address."}, 400

    # Insert user into Users table.
    try:
        # INSERT query for User.
        query_1 = (
            "INSERT INTO Users "
            "(email, username, password, verified)"
            "VALUES (?, ?, ?, ?)"
        )
        args_1 = (
            request.form.get("email"),
            request.form.get("username"),
            password_hash,
            0
        )
        # SELECT query to get user info
        query_2 = (
            "SELECT * FROM Users "
            "WHERE email = ?"
        )
        args_2 = (
            request.form.get("email")
        )
        query(query_1, args_1)
        uid = int(query(query_2, args_2, True)[0][0])
        while True:
            try:
                code = random_string(64)
                # INSERT code into verification table
                query_3 = (
                    "INSERT INTO Verification "
                    "(code, uid)"
                    "VALUES (?, ?)"
                )
                args_3 = (
                    code,
                    uid
                )
                query(query_3, args_3)
                break
            except mysql.connector.errors.IntegrityError:
                continue
    except mysql.connector.errors.IntegrityError:
        log("warning", "Attempted to create a duplicate user.", traceback.format_exc())
        return {"message": "User already exists!"}, 400
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    # Send verification email.

    # Email Contents.
    sent_from = GMAIL_CONFIG.get("user")
    to = request.form.get("email")
    subject = "MusiCloud Email Verification"
    url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
    body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url
    # Prepare actual message
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
    expected_keys = ["email"]
    # Check req body is correctly formed.
    if not verify_req_body(request.form, expected_keys):
        return {"message": "Some info is missing from your request."}, 400

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", request.form.get("email")):
        return {"message": "Bad request."}, 400

    try:
        # SELECT query to get user info
        query_1 = (
            "SELECT * FROM Users "
            "WHERE email = '%s'"
        ) % (
            request.form.get("email")
        )
        user = query(query_1, True)
        if not user:
            return {"message": "Bad request."}, 400
        elif user[0][4] == 1:
            return {"message": "Already verified."}, 403
        uid = user[0][0]
        query_2 = (
            "SELECT * FROM Verification "
            "WHERE uid = %d"
        ) % (
            uid
        )
        code = query(query_2, True)
        if not code:
            while True:
                try:
                    code = random_string(64)
                    # INSERT code into verification table
                    query_3 = (
                        "INSERT INTO Verification "
                        "(code, uid)"
                        "VALUES ('%s', %d)"
                    ) % (
                        code,
                        uid
                    )
                    query(query_3)
                    break
                except mysql.connector.errors.IntegrityError:
                    continue
        else:
            code = code[0][0]
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
        return {"message": "MySQL unavailable."}, 503

    # Send verification email.

    # Email Contents.
    sent_from = GMAIL_CONFIG.get("user")
    to = request.form.get("email")
    subject = "MusiCloud Email Verification"
    url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
    body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url
    # Prepare actual message
    email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (sent_from, to, subject, body)

    try:
        send_mail(sent_from, to, email_text)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())
        return {"message": "Verification mail failed to send."}, 500

    return {"message": "Verification email sent."}
