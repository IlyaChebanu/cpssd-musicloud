# pylint: disable=C0302
"""
/users API controller code.
"""
import re
import traceback
import datetime
import random
from math import ceil

import jwt
import mysql.connector
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError

from ...config import HOST, RESET_TIMEOUT, JWT_SECRET, PROTOCOL
from ...models.errors import NoResults
from ...utils.logger import log
from ...utils import (
    random_string, send_mail, gen_scroll_tokens, gen_timeline_post_object,
    gen_timeline_song_object, notification_sender
)
from ...models.users import (
    insert_user, get_user_via_username, get_user_via_email, make_post,
    create_reset, get_reset_request, delete_reset, post_follow, post_unfollow,
    reset_password, update_reset, get_number_of_posts, get_posts,
    get_follower_count, get_song_count, get_number_of_likes,
    get_following_count, get_following_pair, reset_user_verification,
    reset_email, update_profiler_url, get_following_names, get_follower_names,
    get_timeline, get_timeline_length, get_timeline_posts_only,
    get_timeline_posts_only_length, get_timeline_song_only,
    get_timeline_song_only_length, update_silence_all_notificaitons,
    get_dids_for_a_user, update_silence_follow_notificaitons,
    update_silence_post_notificaitons, update_silence_song_notificaitons,
    update_silence_like_notificaitons, notify_post_dids
)
from ...models.verification import insert_verification, get_verification
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher

USERS = Blueprint("users", __name__)
HASHER = PasswordHasher()


@USERS.route("/follow", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def follow(user_data):
    """
    Endpoint to follow a user.
    """
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

    if other_user[0] == user_data.get("uid"):
        return {"message": "You cannot follow your self"}, 422

    other_user_followers = get_following_pair(
        user_data.get("uid"), other_user[0]
    )

    if (user_data.get("uid"), other_user[0]) not in other_user_followers:
        post_follow(user_data.get("uid"), other_user[0])

    muted = get_user_via_username(user_data.get("username"))[0][6]

    if not muted:
        try:
            dids = []
            for did in get_dids_for_a_user(other_user[0]):
                dids += did
            message = user_data.get("username") + " has started following you."
            notification_sender(message, dids, "New Follower")
        except NoResults:
            pass

    return {
        "message": "You are now following: " + request.json.get("username")
    }, 200


@USERS.route("/unfollow", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def unfollow(user_data):
    """
    Endpoint to unfollow a user.
    """
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

    if other_user[0] == user_data.get("uid"):
        return {"message": "You cannot unfollow your self"}, 422

    post_unfollow(user_data.get("uid"), other_user[0])

    return {
        "message": (
            "You are now no longer following: " + request.json.get("username")
        )
    }, 200


@USERS.route("", methods=["POST"])
@sql_err_catcher()
def register():
    """
    Endpoint to create a new user.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "username": {
                "type": "string",
                "minLength": 1
            },
            "email": {
                "type": "string",
                "pattern": r"[^@]+@[^@]+\.[^@]+",
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
        password_hash = HASHER.hash(request.json.get("password"))
    except Exception:  # pylint:disable=W0703
        log("error", "Failed to hash password", traceback.format_exc())
        return {"message": "Error while hashing password."}, 500

    insert_user(
        request.json.get("email"), request.json.get("username"), password_hash
    )
    uid = int(get_user_via_username(request.json.get("username"))[0][0])
    code = ""
    while True:
        try:
            code = random_string(64)
            insert_verification(code, uid)
            break
        except mysql.connector.errors.IntegrityError:
            continue

    subject = "MusiCloud Email Verification"
    url = PROTOCOL + HOST + "/api/v1/auth/verify?code=" + code
    body = (
        "Welcome to MusiCloud. Please click on this URL to verify "
        "your account:\n" + url
    )

    try:
        send_mail(request.json.get("email"), subject, body)
    except Exception:  # pylint:disable=W0703
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "User created!"}, 200


@USERS.route("/reverify", methods=["POST"])
@sql_err_catcher()
def reverify():
    """
    Endpoint to resend the verification email.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "pattern": r"[^@]+@[^@]+\.[^@]+",
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

    user_data = get_user_via_email(request.json.get("email"))
    if user_data[0][4] == 1:
        return {"message": "Already verified."}, 403
    code = get_verification(user_data[0][0])
    if not code:
        while True:
            try:
                code = random_string(64)
                insert_verification(code, user_data[0][0])
                break
            except mysql.connector.errors.IntegrityError:
                continue
    else:
        code = code[0][0]

    subject = "MusiCloud Email Verification"
    url = PROTOCOL + HOST + "/api/v1/auth/verify?code=" + code
    body = (
        "Welcome to MusiCloud. Please click on this URL to verify "
        "your account:\n" + url
    )

    try:
        send_mail(request.json.get("email"), subject, body)
    except Exception:  # pylint:disable=W0703
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "Verification email sent."}, 200


@USERS.route("", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def user(user_data):
    """
    Endpoint to get a user's information.
    """
    username = request.args.get('username')
    if not username:
        return {"message": "Username param can't be empty!"}, 422

    user_info = get_user_via_username(username)
    follower_data = get_follower_count(user_info[0][0])
    following_data = get_following_count(user_info[0][0])
    songs = get_song_count(user_info[0][0])
    user_posts = get_number_of_posts(user_info[0][0])
    likes = get_number_of_likes(user_info[0][0])
    if user_data.get("username").lower() == username.lower():
        follow_status = None
    else:
        follow_status = len(
            get_following_pair(user_data.get("uid"), user_info[0][0])
        )
    return {
        "profile_pic_url": user_info[0][5],
        "username": user_info[0][2],
        "followers": follower_data,
        "following": following_data,
        "songs": songs,
        "posts": user_posts,
        "likes": likes,
        "follow_status": follow_status,
        "follow_notification_status": user_info[0][6],
        "post_notification_status": user_info[0][7],
        "song_notification_status": user_info[0][8],
        "like_notification_status": user_info[0][9]
    }, 200


@USERS.route("/reset", methods=["GET"])
@sql_err_catcher()
def get_reset():
    """
    Endpoint to send a password reset email.
    """
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
    body = (
        "To reset your MusiCloud password, please enter the following code in "
        "the forgot password section of our app:\n" + str(reset_code)
    )

    try:
        send_mail(email, subject, body)
    except Exception:  # pylint:disable=W0703
        log("error", "Failed to send email.", traceback.format_exc())

    return {"message": "Email sent."}, 200


@USERS.route("/reset", methods=["POST"])
@sql_err_catcher()
def reset():
    """
    Endpoint to reset a user's password.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "pattern": r"[^@]+@[^@]+\.[^@]+",
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
        password_hash = HASHER.hash(request.json.get("password"))
    except Exception:  # pylint:disable=W0703
        log("error", "Failed to hash password", traceback.format_exc())
        return {"message": "Error while hashing password."}, 500

    uid = get_user_via_email(email)[0][0]
    time_issued = get_reset_request(uid, code)[0][2]

    time_expired = time_issued + datetime.timedelta(minutes=RESET_TIMEOUT)
    now = datetime.datetime.utcnow()

    if (now < time_issued) or (now > time_expired):
        return {
            "message": "The reset code has expired. Please request a new one."
        }, 401

    reset_password(uid, password_hash)
    delete_reset(uid)

    return {"message": "Password reset."}, 200


@USERS.route("/post", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def post(user_data):
    """
    Endpoint to create a post.
    """
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
    make_post(user_data.get("uid"), request.json.get("message"), time_issued)

    try:
        dids = []
        for did in notify_post_dids(user_data.get("uid")):
            dids += did
        message = user_data.get("username") + " just posted."
        notification_sender(message, dids, "New Post")
    except NoResults:
        pass

    return {"message": "Message posted."}, 200


@USERS.route("/posts", methods=["GET"])
@sql_err_catcher()
@auth_required()
def posts():
    """
    Endpoint to get all a user's posts.
    """
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
        total_pages = ceil(total_posts / posts_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * posts_per_page) - posts_per_page
        user_posts = get_posts(uid, start_index, posts_per_page)

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "posts_per_page": posts_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "posts_per_page": posts_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "posts": user_posts
        }, 200
    if next_page and back_page:
        return {
            "message": (
                "You can't send both a 'next_page' token and a 'back_page' "
                "token."
            )
        }, 422

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

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "posts_per_page": posts_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "posts": user_posts
    }, 200


@USERS.route("", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_user(user_data):
    """
    Endpoint to change a user's email and/or password.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "password": {
                "type": "string",
                "minLength": 1
            },
            "email": {
                "type": "string",
                "pattern": r"[^@]+@[^@]+\.[^@]+",
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
    user_password = get_user_via_username(user_data.get("username"))[0][3]
    try:
        HASHER.verify(user_password, request.json.get("current_password"))
    except VerifyMismatchError:
        return {"message": "Incorrect password!"}, 403

    res_string = ""
    code = ""

    if request.json.get("email"):
        reset_user_verification(user_data.get("uid"))
        while True:
            try:
                code = random_string(64)
                insert_verification(code, user_data.get("uid"))
                break
            except mysql.connector.errors.IntegrityError:
                continue

        subject = "MusiCloud Email Verification"
        url = PROTOCOL + HOST + "/api/v1/auth/verify?code=" + code
        body = (
            "Welcome to MusiCloud. Please click on this URL to verify your "
            "account:\n" + url
        )

        try:
            send_mail(request.json.get("email"), subject, body)
        except Exception:  # pylint:disable=W0703
            log("error", "Failed to send email.", traceback.format_exc())

        reset_email(user_data.get("uid"), request.json.get("email"))
        res_string += "Email reset, and verification mail sent. "

    if request.json.get("password"):
        try:
            password_hash = HASHER.hash(request.json.get("password"))
        except Exception:  # pylint:disable=W0703
            log("error", "Failed to hash password", traceback.format_exc())
            return {"message": "Error while hashing password."}, 500

        reset_password(user_data.get("uid"), password_hash)
        res_string += "Password reset."

    return {"message": res_string}, 200


@USERS.route("/profiler", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def profiler(user_data):
    """
    Endpoint to change a user's profile picture.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "pattern": (
                    r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|"
                    r"[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
                ),
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

    update_profiler_url(user_data.get("uid"), request.json.get("url"))
    return {"message": "Profile picture URL updated."}, 200


@USERS.route("/followers", methods=["GET"])
@sql_err_catcher()
@auth_required()
def followers():
    """
    Endpoint to get all a user's followers.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        username = request.args.get('username')
        if not username:
            return {"message": "Username param can't be empty!"}, 422

        uid = get_user_via_username(username)[0][0]

        users_per_page = request.args.get('users_per_page')
        if not users_per_page:
            users_per_page = 50
        users_per_page = int(users_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_users = get_follower_count(uid)
        total_pages = ceil(total_users / users_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * users_per_page) - users_per_page
        follower_accounts = get_follower_names(
            uid, start_index, users_per_page
        )

        res = []
        for user_data in follower_accounts:
            res.append({
                "username": user_data[0],
                "profiler": user_data[1],
                "follow_back": user_data[2]
            })

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "users_per_page": users_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "users_per_page": users_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "followers": res
        }, 200
    if next_page and back_page:
        return {
            "message": (
                "You can't send both a 'next_page' token and a 'back_page' "
                "token."
            )
        }, 422

    token = next_page
    if not token:
        token = back_page
    token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

    uid = token.get("uid")
    current_page = token.get("current_page")
    users_per_page = token.get("users_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * users_per_page) - users_per_page

    follower_accounts = get_follower_names(uid, start_index, users_per_page)
    res = []
    for user_data in follower_accounts:
        res.append({
            "username": user_data[0],
            "profiler": user_data[1],
            "follow_back": user_data[2]
        })

    jwt_payload = {
        "uid": uid,
        "total_pages": total_pages,
        "users_per_page": users_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "users_per_page": users_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "followers": res
    }, 200


@USERS.route("/following", methods=["GET"])
@sql_err_catcher()
@auth_required()
def following():
    """
    Endpoint to get all a user's followings.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        username = request.args.get('username')
        if not username:
            return {"message": "Username param can't be empty!"}, 422

        uid = get_user_via_username(username)[0][0]

        users_per_page = request.args.get('users_per_page')
        if not users_per_page:
            users_per_page = 50
        users_per_page = int(users_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_users = get_following_count(uid)
        total_pages = ceil(total_users / users_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * users_per_page) - users_per_page
        following_accounts = get_following_names(
            uid, start_index, users_per_page
        )
        res = []
        for user_data in following_accounts:
            res.append({
                "username": user_data[0],
                "profiler": user_data[1],
                "follow_back": user_data[2]
            })

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "users_per_page": users_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "users_per_page": users_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "following": res
        }, 200
    if next_page and back_page:
        return {
            "message": (
                "You can't send both a 'next_page' token and a 'back_page' "
                "token."
            )
        }, 422

    token = next_page
    if not token:
        token = back_page
    token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

    uid = token.get("uid")
    current_page = token.get("current_page")
    users_per_page = token.get("users_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * users_per_page) - users_per_page

    following_accounts = get_following_names(uid, start_index, users_per_page)
    res = []
    for user_data in following_accounts:
        res.append({
            "username": user_data[0],
            "profiler": user_data[1],
            "follow_back": user_data[2]
        })

    jwt_payload = {
        "uid": uid,
        "total_pages": total_pages,
        "users_per_page": users_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "users_per_page": users_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "following": res
    }, 200


@USERS.route("/timeline", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def timeline(user_data):  # pylint:disable=R0912, R0914, R0915
    """
    Endpoint to get all a user's timeline.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    uid = user_data.get("uid")
    if not next_page and not back_page:
        songs_only = request.args.get('songs_only')
        posts_only = request.args.get('posts_only')
        if songs_only and posts_only:
            return {
                "current_page": 1,
                "total_pages": 1,
                "items_per_page": 50,
                "next_page": None,
                "back_page": None,
                "timeline": []
            }, 200

        items_per_page = request.args.get('items_per_page')
        if not items_per_page:
            items_per_page = 50
        items_per_page = int(items_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        if songs_only:
            total_items = get_timeline_song_only_length(uid)
        elif posts_only:
            total_items = get_timeline_posts_only_length(uid)
        else:
            total_items = get_timeline_length(uid)

        total_pages = ceil(total_items / items_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * items_per_page) - items_per_page

        if songs_only:
            timeline_items = get_timeline_song_only(
                uid, start_index, items_per_page
            )
        elif posts_only:
            timeline_items = get_timeline_posts_only(
                uid, start_index, items_per_page
            )
        else:
            timeline_items = get_timeline(uid, start_index, items_per_page)

        res = []
        for item in timeline_items:
            if item[-1] == "song":
                res.append(gen_timeline_song_object(item))
            else:
                res.append(gen_timeline_post_object(item))

        jwt_payload = {
            "songs_only": songs_only,
            "posts_only": posts_only,
            "total_pages": total_pages,
            "items_per_page": items_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "items_per_page": items_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "timeline": res
        }, 200
    if next_page and back_page:
        return {
            "message": (
                "You can't send both a 'next_page' token and a 'back_page' "
                "token."
            )
        }, 422

    token = next_page
    if not token:
        token = back_page
    token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

    songs_only = token.get("songs_only")
    posts_only = token.get("posts_only")
    current_page = token.get("current_page")
    items_per_page = token.get("items_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * items_per_page) - items_per_page

    if songs_only:
        timeline_items = get_timeline_song_only(
            uid, start_index, items_per_page
        )
    elif posts_only:
        timeline_items = get_timeline_posts_only(
            uid, start_index, items_per_page
        )
    else:
        timeline_items = get_timeline(uid, start_index, items_per_page)

    res = []
    for item in timeline_items:
        if item[-1] == "song":
            res.append(gen_timeline_song_object(item))
        else:
            res.append(gen_timeline_post_object(item))

    jwt_payload = {
        "songs_only": songs_only,
        "posts_only": posts_only,
        "total_pages": total_pages,
        "items_per_page": items_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "items_per_page": items_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "timeline": res
    }, 200


@USERS.route("/notifications", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_notification_status(user_data):
    """
    Endpoint to change a user's global notification preferences.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "status": {
                "type": "integer",
                "minimum": 0,
                "maximum": 1
            }
        },
        "required": ["status"],
        "minProperties": 1
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    update_silence_all_notificaitons(
        user_data.get("uid"), request.json.get("status")
    )

    if request.json.get("status") == 0:
        return {"message": "All notifications unmuted"}, 200
    return {"message": "All notifications muted"}, 200


@USERS.route("/notifications/follows", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_follow_notification_status(user_data):
    """
    Endpoint to change a user's follow notification preferences.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "status": {
                "type": "integer",
                "minimum": 0,
                "maximum": 1
            }
        },
        "required": ["status"],
        "minProperties": 1
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    update_silence_follow_notificaitons(
        user_data.get("uid"), request.json.get("status")
    )

    if request.json.get("status") == 0:
        return {"message": "Follow notifications unmuted"}, 200
    return {"message": "Follow notifications muted"}, 200


@USERS.route("/notifications/posts", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_post_notification_status(user_data):
    """
    Endpoint to change a user's post notification preferences.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "status": {
                "type": "integer",
                "minimum": 0,
                "maximum": 1
            }
        },
        "required": ["status"],
        "minProperties": 1
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    update_silence_post_notificaitons(
        user_data.get("uid"), request.json.get("status")
    )

    if request.json.get("status") == 0:
        return {"message": "Post notifications unmuted"}, 200
    return {"message": "Post notifications muted"}, 200


@USERS.route("/notifications/songs", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_song_notification_status(user_data):
    """
    Endpoint to change a user's song notification preferences.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "status": {
                "type": "integer",
                "minimum": 0,
                "maximum": 1
            }
        },
        "required": ["status"],
        "minProperties": 1
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    update_silence_song_notificaitons(
        user_data.get("uid"), request.json.get("status")
    )

    if request.json.get("status") == 0:
        return {"message": "Song notifications unmuted"}, 200
    return {"message": "Song notifications muted"}, 200


@USERS.route("/notifications/likes", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def patch_like_notification_status(user_data):
    """
    Endpoint to change a user's like notification preferences.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "status": {
                "type": "integer",
                "minimum": 0,
                "maximum": 1
            }
        },
        "required": ["status"],
        "minProperties": 1
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    update_silence_like_notificaitons(
        user_data.get("uid"), request.json.get("status")
    )

    if request.json.get("status") == 0:
        return {"message": "Like notifications unmuted"}, 200
    return {"message": "Like notifications muted"}, 200
