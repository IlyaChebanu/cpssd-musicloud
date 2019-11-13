import datetime
import json

import boto3
import jwt
from botocore.exceptions import NoCredentialsError
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError

from ...config import AWS_CREDS, JWT_SECRET
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher
from ...utils.logger import log
from ...utils import permitted_to_edit, gen_scroll_tokens
from ...models.audio import (
    insert_song, insert_song_state, get_song_state, get_all_compiled_songs,
    get_all_compiled_songs_by_uid, get_all_uncompiled_songs_by_uid, get_number_of_compiled_songs,
    get_number_of_compiled_songs_by_uid, get_number_of_uncompiled_songs_by_uid
)


audio = Blueprint('audio', __name__)


# TODO - edit to provide the url with credentials to the client to directly store to s3
@audio.route("/get_access", methods=["POST"])
def get_access():
    return AWS_CREDS


# TODO - remove the endpoint, handle the logic on the client side 
@audio.route("/upload", methods=["POST"])
def audio_upload():
    aws_access_key = AWS_CREDS['AWSAccessKeyId']
    aws_secret = AWS_CREDS['AWSSecretKey']
    s3 = boto3.client('s3', aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret)
    try:
        f = request.files["song_data"]
        filename = f.filename
        s3.upload_fileobj(f, AWS_CREDS['Bucket'], filename)
        return {"message": "Upload successful"}
    except FileNotFoundError:
        return {"message": "File not found!"}
    except NoCredentialsError:
        return {"message": "Credentials not available"}
    except Exception as e:
        return {"message": str(e)}


@audio.route("", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def create_song(user):
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

    return {"message": "Your song project has been created", "sid": row_id}, 200


@audio.route("/state", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def save_song(user):
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
    return {"message": "You are not permitted to edit song: " + str(request.json.get("sid"))}, 403


@audio.route("/state", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def load_song(user):
    sid = request.args.get('sid')
    if not sid:
        return {"message": "sid param can't be empty!"}, 422
    if permitted_to_edit(sid, user.get("uid")):
        return {"song_state": get_song_state(sid)}, 200
    return {"message": "You are not permitted to edit song: " + sid}, 403


@audio.route("/compiled_songs", methods=["GET"])
@sql_err_catcher()
@auth_required()
def get_compiled_songs():
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        uid = request.args.get("uid")
        if uid:
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
                       "message": "current_page exceeds the total number of pages available(" + str(total_pages) + ")."
                   }, 422

        start_index = (current_page * songs_per_page) - songs_per_page
        if uid:
            compiled_songs = get_all_compiled_songs_by_uid(uid, start_index, songs_per_page)
        else:
            compiled_songs = get_all_compiled_songs(start_index, songs_per_page)

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(current_page, total_pages, jwt_payload)

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "compiled_songs": compiled_songs,
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
        songs_per_page = token.get("songs_per_page")
        total_pages = token.get("total_pages")
        start_index = (current_page * songs_per_page) - songs_per_page

        if uid:
            compiled_songs = get_all_compiled_songs_by_uid(uid, start_index, songs_per_page)
        else:
            compiled_songs = get_all_compiled_songs(start_index, songs_per_page)

        jwt_payload = {
            "uid": uid,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(current_page, total_pages, jwt_payload)

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "compiled_songs": compiled_songs
        }, 200


@audio.route("/uncompiled_songs", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def get_uncompiled_songs(user):
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        total_songs = get_number_of_uncompiled_songs_by_uid(user.get("uid"))

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
                       "message": "current_page exceeds the total number of pages available(" + str(total_pages) + ")."
                   }, 422

        start_index = (current_page * songs_per_page) - songs_per_page
        uncompiled_songs = get_all_uncompiled_songs_by_uid(user.get("uid"), start_index, songs_per_page)

        jwt_payload = {
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(current_page, total_pages, jwt_payload)

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "uncompiled_songs": uncompiled_songs,
        }, 200
    elif next_page and back_page:
        return {"message": "You can't send both a 'next_page' token and a 'back_page' token."}, 422
    else:
        token = next_page
        if not token:
            token = back_page
        token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

        current_page = token.get("current_page")
        songs_per_page = token.get("songs_per_page")
        total_pages = token.get("total_pages")
        start_index = (current_page * songs_per_page) - songs_per_page

        uncompiled_songs = get_all_uncompiled_songs_by_uid(user.get("uid"), start_index, songs_per_page)

        jwt_payload = {
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
        }

        back_page, next_page = gen_scroll_tokens(current_page, total_pages, jwt_payload)

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "uncompiled_songs": uncompiled_songs
        }, 200
