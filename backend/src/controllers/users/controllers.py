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

from ...config import HOST, RESET_TIMEOUT, JWT_SECRET
from ...utils.logger import log
from ...utils import random_string, send_mail, gen_scroll_tokens
from ...models.users import (
    insert_user, get_user_via_username, get_user_via_email, make_post, create_reset, get_reset_request, delete_reset,
    post_follow, post_unfollow, reset_password, update_reset, get_number_of_posts, get_posts, get_follower_count,
    get_song_count, get_number_of_likes, get_following_count, get_following_pair, reset_user_verification, reset_email,
    update_profiler_url
)
from ...models.verification import insert_verification, get_verification
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher

users = Blueprint("users", __name__)


@users.route("/follow", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def follow(user):
    expected_body = {
        "type": "object",
        "properties": {
            "username": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["username"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    other_user = get_user_via_username(request.json.get("username"))[0]

    if other_user[0] == user.get("uid"):
        return {"message": "You cannot follow your self"}, 422

    other_user_followers = get_following_pair(user.get("uid"), other_user[0])

    if (user.get("uid"), other_user[0]) not in other_user_followers:
        post_follow(user.get("uid"), other_user[0])

    return {"message": "You are now following: " + request.json.get("username")}, 200


@users.route("/unfollow", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def unfollow(user):
    expected_body = {
        "type": "object",
        "properties": {
            "username": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["username"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    other_user = get_user_via_username(request.json.get("username"))[0]

    if other_user[2] == user.get("username"):
        return {"message": "You cannot unfollow your self"}, 422

    post_unfollow(user.get("uid"), other_user[0])

    return {"message": "You are now no longer following: " + request.json.get("username")}, 200


@users.route("", methods=["POST"])
@sql_err_catcher()
def register():
    expected_body = {
        "type": "object",
        "properties": {
            "username": {
                "type": "string",
                "minLength": 1
            },
            "email": {
                "type": "string",
                "pattern": "[^@]+@[^@]+\.[^@]+",
                "minLength": 1
            },
            "password": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["username", "email", "password"]
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

    insert_user(request.json.get("email"), request.json.get("username"), password_hash)
    uid = int(get_user_via_username(request.json.get("username"))[0][0])
    while True:
        try:
            code = random_string(64)
            insert_verification(code, uid)
            break
        except mysql.connector.errors.IntegrityError:
            continue


    subject = "MusiCloud Email Verification"
    url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
    body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url

    try:
        send_mail(request.json.get("email"), subject, body)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "User created!"}, 200


@users.route("/reverify", methods=["POST"])
@sql_err_catcher()
def reverify():
    expected_body = {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "pattern": "[^@]+@[^@]+\.[^@]+",
                "minLength": 1
            }
        },
        "required": ["email"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    user = get_user_via_email(request.json.get("email"))
    if user[0][4] == 1:
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

    subject = "MusiCloud Email Verification"
    url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
    body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url

    try:
        send_mail(request.json.get("email"), subject, body)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "Verification email sent."}, 200


@users.route("", methods=["GET"])
@sql_err_catcher()
@auth_required()
def user():
    username = request.args.get('username')
    if not username:
        return {"message": "Username param can't be empty!"}, 422

    user = get_user_via_username(username)
    followers = get_follower_count(user[0][0])
    following = get_following_count(user[0][0])
    songs = get_song_count(user[0][0])
    posts = get_number_of_posts(user[0][0])
    likes = get_number_of_likes(user[0][0])

    return {
        "profile_pic_url": user[0][5],
        "username": user[0][2],
        "followers": followers,
        "following": following,
        "songs": songs,
        "posts": posts,
        "likes": likes
    }, 200


@users.route("/reset", methods=["GET"])
@sql_err_catcher()
def get_reset():
    email = request.args.get('email')
    if not email:
        return {"message": "Email param can't be empty!"}, 422

    # Verify that the email field is a valid email address str.
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"message": "Bad request."}, 400

    reset_code = random.randint(10000000, 99999999)
    time_issued = datetime.datetime.utcnow()

    uid = get_user_via_email(email)[0][0]

    reset_sent = False
    try:
        create_reset(uid, reset_code, time_issued)
        reset_sent = True
    except mysql.connector.errors.IntegrityError:
        pass

    if not reset_sent:
        update_reset(time_issued, reset_code, uid)

    subject = "MusiCloud Password Reset"
    body = """
    To reset your MusiCloud password, please enter the following code in the forgot password section of our app:\n
    """ + str(reset_code)

    try:
        send_mail(request.json.get("email"), subject, body)
    except Exception:
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "Email sent."}, 200


@users.route("/reset", methods=["POST"])
@sql_err_catcher()
def reset():
    expected_body = {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "pattern": "[^@]+@[^@]+\.[^@]+",
                "minLength": 1
            },
            "code": {
                "type": "integer",
                "minimum": 10000000,
                "maximum": 99999999
            },
            "password": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["email", "code", "password"]
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

    uid = get_user_via_email(email)[0][0]
    time_issued = get_reset_request(uid, code)[0][2]

    time_expired = time_issued + datetime.timedelta(minutes=RESET_TIMEOUT)
    now = datetime.datetime.utcnow()

    if (now < time_issued) or (now > time_expired):
        return {"message": "The reset code has expired. Please request a new one."}, 401

    reset_password(uid, password_hash)
    delete_reset(uid)

    return {"message": "Password reset."}, 200


@users.route("/post", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def post(user):
    expected_body = {
        "type": "object",
        "properties": {
            "message": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["message"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    time_issued = datetime.datetime.utcnow()
    make_post(user.get("uid"), request.json.get("message"), time_issued)

    return {"message": "Message posted."}, 200


@users.route("/posts", methods=["GET"])
@sql_err_catcher()
@auth_required()
def posts():
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        username = request.args.get('username')
        if not username:
            return {"message": "Request missing username."}, 422
        uid = get_user_via_username(username)[0][0]

        posts_per_page = request.args.get('posts_per_page')
        if not posts_per_page:
            posts_per_page = 50
        posts_per_page = int(posts_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_posts = get_number_of_posts(uid)

        total_pages = (total_posts // posts_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": "current_page exceeds the total number of pages available(" + str(total_pages) + ")."
            }, 422

        start_index = (current_page * posts_per_page) - posts_per_page
        user_posts = get_posts(uid, start_index, posts_per_page)

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "posts_per_page": posts_per_page,
        }

        back_page, next_page = gen_scroll_tokens(current_page, total_pages, jwt_payload)

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "posts_per_page": posts_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "posts": user_posts
        }, 200
    elif next_page and back_page:
        return {"message": "You can't send both a 'next_page' token and a 'back_page' token."}, 422
    else:
        token = next_page
        if not token:
            token = back_page
        token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

        uid = token.get("uid")
        current_page = token.get("current_page")
        posts_per_page = token.get("posts_per_page")
        total_pages = token.get("total_pages")
        start_index = (current_page * posts_per_page) - posts_per_page

        user_posts = get_posts(uid, start_index, posts_per_page)

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "posts_per_page": posts_per_page,
        }

        back_page, next_page = gen_scroll_tokens(current_page, total_pages, jwt_payload)

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "posts_per_page": posts_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "posts": user_posts
        }, 200


@users.route("", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_user(user):
    expected_body = {
        "type": "object",
        "properties": {
            "password": {
                "type": "string",
                "minLength": 1
            },
            "email": {
                "type": "string",
                "pattern": "[^@]+@[^@]+\.[^@]+",
                "minLength": 1
            },
            "current_password": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["current_password"],
        "minProperties": 2
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    # Check the user's password against the provided one
    user_password = get_user_via_username(user.get("username"))[0][3]
    if not argon2.verify(request.json.get("current_password"), user_password):
        return {"message": "Incorrect password!"}, 401

    res_string = ""

    if request.json.get("email"):
        reset_user_verification(user.get("uid"))
        while True:
            try:
                code = random_string(64)
                insert_verification(code, user.get("uid"))
                break
            except mysql.connector.errors.IntegrityError:
                continue

        subject = "MusiCloud Email Verification"
        url = "http://" + HOST + "/api/v1/auth/verify?code=" + code
        body = "Welcome to MusiCloud. Please click on this URL to verify your account:\n" + url

        try:
            send_mail(request.json.get("email"), subject, body)
        except Exception:
            log("error", "Failed to send email.", traceback.format_exc())

        reset_email(user.get("uid"), request.json.get("email"))
        res_string += "Email reset, and verification mail sent. "

    if request.json.get("password"):
        try:
            password_hash = argon2.hash(request.json.get("password"))
        except Exception:
            log("error", "Failed to hash password", traceback.format_exc())
            return {"message": "Error while hashing password."}, 500

        reset_password(user.get("uid"), password_hash)
        res_string += "Password reset."

    return {"message": res_string}, 200


@users.route("/profiler", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def profiler(user):
    expected_body = {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "pattern": "http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+",
                "minLength": 1
            },
        },
        "required": ["url"],
        "minProperties": 1
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    update_profiler_url(user.get("uid"), request.json.get("url"))
    return {"message": "Profile picture URL updated."}, 200