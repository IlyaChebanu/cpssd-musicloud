"""
/audio API controller code.
"""
import datetime
import json

import jwt
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError

from ...config import JWT_SECRET
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher
from ...utils.logger import log
from ...utils import permitted_to_edit, gen_scroll_tokens
from ...models.audio import (
    insert_song, insert_song_state, get_song_state, get_all_compiled_songs,
    get_all_compiled_songs_by_uid, get_all_editable_songs_by_uid,
    get_number_of_compiled_songs, get_number_of_compiled_songs_by_uid,
    get_number_of_editable_songs_by_uid, get_song_data, post_like, post_unlike,
    get_number_of_liked_songs_by_uid, get_all_liked_songs_by_uid,
    get_like_pair, update_published_status, update_compiled_url,
    update_cover_url
)
from ...models.users import get_user_via_username
from ...models.errors import NoResults

AUDIO = Blueprint('audio', __name__)


@AUDIO.route("", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def create_song(user):
    """
    Endpoint for creating a new song.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["title"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    row_id = insert_song(
        user.get("uid"),
        request.json.get("title"),
        0,
        datetime.datetime.utcnow(),
        False
    )

    insert_song_state(
        row_id,
        json.dumps({}),
        datetime.datetime.utcnow(),
    )

    return {
        "message": "Your song project has been created", "sid": row_id
    }, 200


@AUDIO.route("/state", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def save_song(user):
    """
    Endpoint for saving song state.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            },
            "song_state": {
                "type": "object"
            }
        },
        "required": ["sid", "song_state"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if permitted_to_edit(request.json.get("sid"), user.get("uid")):
        insert_song_state(
            request.json.get("sid"),
            json.dumps(request.json.get("song_state")),
            datetime.datetime.utcnow(),
        )
        return {"message": "Song state saved."}, 200
    return {
        "message": "You are not permitted to edit song: " + str(
            request.json.get("sid")
        )
    }, 403


@AUDIO.route("/state", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def load_song(user):
    """
    Endpoint for loading song state.
    """
    sid = request.args.get('sid')
    if not sid:
        return {"message": "sid param can't be empty!"}, 422
    if permitted_to_edit(sid, user.get("uid")):
        return {"song_state": get_song_state(sid)}, 200
    return {"message": "You are not permitted to edit song: " + sid}, 403


@AUDIO.route("/compiled_songs", methods=["GET"])
@sql_err_catcher()
@auth_required()
def get_compiled_songs():  # pylint: disable=R0912,R0915
    """
    Endpoint for getting all publicly available songs.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    uid = None
    if not next_page and not back_page:
        username = request.args.get('username')
        if username:
            uid = get_user_via_username(username)[0][0]
            total_songs = get_number_of_compiled_songs_by_uid(uid)
        else:
            total_songs = get_number_of_compiled_songs()

        songs_per_page = request.args.get('songs_per_page')
        if not songs_per_page:
            songs_per_page = 50
        songs_per_page = int(songs_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = (total_songs // songs_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * songs_per_page) - songs_per_page

        if uid:
            compiled_songs = get_all_compiled_songs_by_uid(
                uid, start_index, songs_per_page
            )
        else:
            compiled_songs = get_all_compiled_songs(
                start_index, songs_per_page
            )

        res = []
        for song in compiled_songs:
            res.append({
                "sid": song[0],
                "username": song[1],
                "title": song[2],
                "duration": song[3],
                "created": song[4],
                "public": song[5],
                "url": song[6],
                "cover": song[7],
                "genre": song[8],
                "likes": song[9]
            })

        jwt_payload = {
            "username": username,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "songs": res,
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

    username = token.get("username")
    current_page = token.get("current_page")
    songs_per_page = token.get("songs_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * songs_per_page) - songs_per_page

    if username:
        uid = get_user_via_username(username)[0][0]
        compiled_songs = get_all_compiled_songs_by_uid(
            uid, start_index, songs_per_page
        )
    else:
        compiled_songs = get_all_compiled_songs(
            start_index, songs_per_page
        )

    res = []
    for song in compiled_songs:
        res.append({
            "sid": song[0],
            "username": song[1],
            "title": song[2],
            "duration": song[3],
            "created": song[4],
            "public": song[5],
            "url": song[6],
            "cover": song[7],
            "genre": song[8],
            "likes": song[9]
        })

    jwt_payload = {
        "username": username,
        "total_pages": total_pages,
        "songs_per_page": songs_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "songs_per_page": songs_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "songs": res
    }, 200


@AUDIO.route("/song", methods=["GET"])
@sql_err_catcher()
@auth_required()
def get_song():
    """
    Endpoint for getting info for a single song.
    """
    sid = request.args.get('sid')
    if not sid:
        return {"message": "sid param can't be empty!"}, 422

    song = get_song_data(sid)[0]
    res = {
        "sid": song[0],
                "username": song[1],
                "title": song[2],
                "duration": song[3],
                "created": song[4],
                "public": song[5],
                "url": song[6],
                "cover": song[7],
                "genre": song[8],
                "likes": song[9]
    }
    return {"song": res}, 200


@AUDIO.route("/like", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def like_song(user):
    """
    Endpoint for liking a song.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["sid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    try:
        get_song_data(request.json.get("sid"))
    except NoResults:
        return {"message": "Song does not exist!"}, 400

    like_pair = get_like_pair(user.get("uid"), request.json.get("sid"))

    if (user.get("uid"), request.json.get("sid")) not in like_pair:
        post_like(user.get("uid"), request.json.get("sid"))

    return {"message": "Song liked"}, 200


@AUDIO.route("/unlike", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def unlike_song(user):
    """
    Endpoint for unliking a song.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["sid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    post_unlike(user.get("uid"), request.json.get("sid"))
    return {"message": "Song unliked"}, 200


@AUDIO.route("/editable_songs", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def get_editable_songs(user):
    """
    Endpoint for getting all the songs a user may edit.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        total_songs = get_number_of_editable_songs_by_uid(user.get("uid"))

        songs_per_page = request.args.get('songs_per_page')
        if not songs_per_page:
            songs_per_page = 50
        songs_per_page = int(songs_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = (total_songs // songs_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * songs_per_page) - songs_per_page
        editable_songs = get_all_editable_songs_by_uid(
            user.get("uid"), start_index, songs_per_page
        )
        res = []
        for song in editable_songs:
            res.append({
                "sid": song[0],
                "username": song[1],
                "title": song[2],
                "duration": song[3],
                "created": song[4],
                "public": song[5],
                "url": song[6],
                "cover": song[7],
                "genre": song[8],
                "likes": song[9]
            })

        jwt_payload = {
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "songs": res,
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

    current_page = token.get("current_page")
    songs_per_page = token.get("songs_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * songs_per_page) - songs_per_page

    editable_songs = get_all_editable_songs_by_uid(
        user.get("uid"), start_index, songs_per_page
    )
    res = []
    for song in editable_songs:
        res.append({
            "sid": song[0],
            "username": song[1],
            "title": song[2],
            "duration": song[3],
            "created": song[4],
            "public": song[5],
            "url": song[6],
            "cover": song[7],
            "genre": song[8],
            "likes": song[9]
        })


    jwt_payload = {
        "total_pages": total_pages,
        "songs_per_page": songs_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "songs_per_page": songs_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "songs": res
    }, 200


@AUDIO.route("/liked_songs", methods=["GET"])
@sql_err_catcher()
@auth_required()
def get_liked_songs():
    """
    Endpoint for getting all the songs a user has liked.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        username = request.args.get('username')
        if not username:
            return {"message": "username param can't be empty!"}, 422

        uid = get_user_via_username(username)[0][0]
        total_songs = get_number_of_liked_songs_by_uid(uid)

        songs_per_page = request.args.get('songs_per_page')
        if not songs_per_page:
            songs_per_page = 50
        songs_per_page = int(songs_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = (total_songs // songs_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * songs_per_page) - songs_per_page

        liked_songs = get_all_liked_songs_by_uid(
            uid, start_index, songs_per_page
        )

        res = []
        for song in liked_songs:
            res.append({
                "sid": song[0],
                "username": song[1],
                "title": song[2],
                "duration": song[3],
                "created": song[4],
                "public": song[5],
                "url": song[6],
                "cover": song[7],
                "genre": song[8],
                "likes": song[9]
            })

        jwt_payload = {
            "username": username,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "songs": res,
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

    username = token.get("username")
    current_page = token.get("current_page")
    songs_per_page = token.get("songs_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * songs_per_page) - songs_per_page

    uid = get_user_via_username(username)[0][0]
    liked_songs = get_all_liked_songs_by_uid(
        uid, start_index, songs_per_page
    )

    res = []
    for song in liked_songs:
        res.append({
            "sid": song[0],
            "username": song[1],
            "title": song[2],
            "duration": song[3],
            "created": song[4],
            "public": song[5],
            "url": song[6],
            "cover": song[7],
            "genre": song[8],
            "likes": song[9]
        })

    jwt_payload = {
        "username": username,
        "total_pages": total_pages,
        "songs_per_page": songs_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "songs_per_page": songs_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "songs": res
    }, 200


@AUDIO.route("/publish", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def publish_song(user):
    """
    Endpoint for updating a songs public state to public.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["sid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if not permitted_to_edit(request.json.get("sid"), user.get("uid")):
        return {"message": "You can't publish that song!"}, 401

    update_published_status(1, request.json.get("sid"))

    return {"message": "Song published."}, 200


@AUDIO.route("/unpublish", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def unpublish_song(user):
    """
    Endpoint for updating a songs public state to private.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["sid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if not permitted_to_edit(request.json.get("sid"), user.get("uid")):
        return {"message": "You can't publish that song!"}, 401

    update_published_status(0, request.json.get("sid"))

    return {"message": "Song unpublished."}, 200


@AUDIO.route("/compiled_url", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def compiled_url(user):
    """
    Endpoint for updating a songs compiled version URl.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            },
            "url": {
                "type": "string",
                "pattern": (
                    r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|"
                    r"(?:%[0-9a-fA-F][0-9a-fA-F]))+"
                ),
                "minLength": 1
            },
            "duration": {
                "type": "integer",
                "minimum": 0
            }
        },
        "required": ["sid", "url", "duration"],
        "minProperties": 3
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if not permitted_to_edit(request.json.get("sid"), user.get("uid")):
        return {"message": "You can't update that song!"}, 401

    update_compiled_url(
        request.json.get("sid"),
        request.json.get("url"),
        request.json.get("duration")
    )
    return {"message": "Compiled song URL updated."}, 200


@AUDIO.route("/cover_art", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def cover_url(user):
    """
    Endpoint for updating a songs cover art URl.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            },
            "url": {
                "type": "string",
                "pattern": (
                    r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|"
                    r"[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
                ),
                "minLength": 1
            }
        },
        "required": ["sid", "url"],
        "minProperties": 2
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if not permitted_to_edit(request.json.get("sid"), user.get("uid")):
        return {"message": "You can't update that song!"}, 401

    update_cover_url(request.json.get("sid"), request.json.get("url"))
    return {"message": "Cover URL updated."}, 200
