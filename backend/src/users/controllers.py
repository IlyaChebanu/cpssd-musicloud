import random
import re
import smtplib
import string

import mysql.connector
from passlib.hash import argon2
from flask import Blueprint
from flask import request

from ..config import GMAIL_CONFIG
from ..query import query

users = Blueprint("users", __name__)


def random_string(length):
    """Generate a random string of fixed length """
    letters = string.printable
    return ''.join(random.choice(letters) for i in range(length))


@users.route("/", methods=["POST"])
def index():
    expected_keys = ["username", "email", "password"]
    # Check req body is correctly formed.
    if all(k in request.form for k in expected_keys):
        for k in expected_keys:
            if len(request.form.get(k)) == 0:
                return {"message": "Some info is missing from your request."}, 400
        try:
            # Hash the inputted password
            password_hash = argon2.hash(request.form.get("password"))
        except:
            return {"message": "Error while hashing password."}, 500

        # Verify that the email field is a valid email address str.
        if not re.match(r"[^@]+@[^@]+\.[^@]+", request.form.get("email")):
            return {"message": "Invalid email address"}, 400

        # Insert user into Users table.
        try:
            # INSERT query for User.
            query_1 = (
                "INSERT INTO Users "
                "(email, username, password, verified)"
                "VALUES ('%s', '%s', '%s', %d)"
            ) % (
                request.form.get("email"),
                request.form.get("username"),
                password_hash,
                0
            )
            # SELECT query to get user info
            query_2 = (
                "SELECT * FROM Users "
                "WHERE email = '%s'"
            ) % (
                request.form.get("email")
            )
            query(query_1)
            uid = int(query(query_2, True)[0][0])
            while True:
                try:
                    code = random_string(random.randint(100, 255))
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
        except mysql.connector.errors.IntegrityError:
            return {"message": "User already exists!"}, 400
        except Exception:
            return {"message": "MySQL unavailable."}, 503

        # Send verification email.

        # Email Contents.
        sent_from = GMAIL_CONFIG.get("email")
        to = request.form.get("email")
        subject = "MusiCloud Email Verification"
        url = "http://127.0.0.1:5000/api/v1/auth/verify/?code=" + code
        body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url

        # Prepare actual message
        email_text = """From: %s\nTo: %s\nSubject: %s\n\n%s
        """ % (sent_from, to, subject, body)

        try:
            # Connect to SMTP server.
            smtp = smtplib.SMTP()
            server = "smtp.gmail.com"
            port = 587
            smtp.connect(server, port)
            smtp.ehlo()
            smtp.starttls()
            smtp.login(GMAIL_CONFIG.get("user"), GMAIL_CONFIG.get("password"))

            # Send email & close connection.
            smtp.sendmail(sent_from, to, email_text)
            smtp.close()
        except:
            return {"message": "Verification mail failed to send."}, 500

        return {"message": "User created!"}
    else:
        return {"message": "Some info is missing from your request."}, 400
