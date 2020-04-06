# pylint: disable=C0302
"""
/audio API controller code.
"""
import datetime
import json
from math import ceil

import jwt
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError

from ...config import JWT_SECRET
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher
from ...utils.logger import log
from ...utils import (
    permitted_to_edit, gen_scroll_tokens, gen_song_object, gen_playlist_object,
    notification_sender, gen_folder_object, gen_file_object
)
from ...models.audio import (
    insert_song, insert_song_state, get_song_state, get_all_compiled_songs,
    get_all_compiled_songs_by_uid, get_all_editable_songs_by_uid,
    get_number_of_compiled_songs, get_number_of_compiled_songs_by_uid,
    get_number_of_editable_songs_by_uid, get_song_data, post_like, post_unlike,
    get_number_of_liked_songs_by_uid, get_all_liked_songs_by_uid,
    get_like_pair, update_published_status, update_compiled_url,
    update_cover_url, create_playlist, get_playlist, delete_playlist_data,
    delete_playlist, get_playlists, get_number_of_playlists,
    get_number_of_songs_in_playlist, get_playlist_data, add_to_playlist,
    remove_from_playlist, get_from_playlist, update_playlist_timestamp,
    update_playlist_name, update_publised_timestamp, notify_like_dids,
    notify_song_dids, update_song_name, update_description,
    get_number_of_searchable_songs, get_all_search_results, delete_song_data,
    create_folder_entry, add_sample, get_folder_entry, delete_folder_entry,
    get_root_folder_entry, delete_file_entry, move_folder_entry,
    move_file_entry, get_child_folders, get_child_files
)
from ...models.users import get_user_via_username
from ...models.errors import NoResults

AUDIO = Blueprint('audio', __name__)


@AUDIO.route("", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def create_song(user_data):
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
        user_data.get("uid"),
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


@AUDIO.route("/rename", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def rename_song(user_data):
    """
    Endpoint for renaming new song.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            },
            "title": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["sid", "title"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
        return {"message": "You can't rename that song!"}, 401

    update_song_name(request.json.get("title"), request.json.get("sid"))

    return {"message": "Song renamed"}, 200


@AUDIO.route("/state", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def save_song(user_data):
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

    if permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
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
def load_song(user_data):
    """
    Endpoint for loading song state.
    """
    sid = request.args.get('sid')
    if not sid:
        return {"message": "sid param can't be empty!"}, 422
    if permitted_to_edit(sid, user_data.get("uid")):
        return {"song_state": json.loads(get_song_state(sid))}, 200
    return {"message": "You are not permitted to edit song: " + sid}, 403


@AUDIO.route("/compiled_songs", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def get_compiled_songs(user_data):  # pylint: disable=R0912,R0915
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

        total_pages = ceil(total_songs / songs_per_page)
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
                uid, start_index, songs_per_page, user_data.get("uid")
            )
        else:
            compiled_songs = get_all_compiled_songs(
                start_index, songs_per_page, user_data.get("uid")
            )

        res = []
        for song in compiled_songs:
            res.append(gen_song_object(song))

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
            uid, start_index, songs_per_page, user_data.get("uid")
        )
    else:
        compiled_songs = get_all_compiled_songs(
            start_index, songs_per_page, user_data.get("uid")
        )

    res = []
    for song in compiled_songs:
        res.append(gen_song_object(song))

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
@auth_required(return_user=True)
def get_song(user_data):
    """
    Endpoint for getting info for a single song.
    """
    sid = request.args.get('sid')
    if not sid:
        return {"message": "sid param can't be empty!"}, 422

    song = get_song_data(sid, user_data.get("uid"))[0]
    res = gen_song_object(song)
    return {"song": res}, 200


@AUDIO.route("/like", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def like_song(user_data):
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
        song = get_song_data(
            request.json.get("sid"), user_data.get("uid")
        )
    except NoResults:
        return {"message": "Song does not exist!"}, 400

    if user_data.get("username") == song[0][1]:
        return {"message": "You cannot like your own song"}, 422

    like_pair = get_like_pair(user_data.get("uid"), request.json.get("sid"))

    if (user_data.get("uid"), request.json.get("sid")) not in like_pair:
        post_like(user_data.get("uid"), request.json.get("sid"))

    try:
        dids = []
        for did in notify_like_dids(request.json.get("sid")):
            dids += did
        message = (
            user_data.get("username") + " just liked your song: \""
            + song[0][2] + "\""
        )
        notification_sender(message, dids, "New Like")
    except NoResults:
        pass

    return {"message": "Song liked"}, 200


@AUDIO.route("/unlike", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def unlike_song(user_data):
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

    try:
        song = get_song_data(
            request.json.get("sid"), user_data.get("uid")
        )
    except NoResults:
        return {"message": "Song does not exist!"}, 400

    if user_data.get("username") == song[0][1]:
        return {"message": "You cannot unlike your own song"}, 422

    post_unlike(user_data.get("uid"), request.json.get("sid"))
    return {"message": "Song unliked"}, 200


@AUDIO.route("/editable_songs", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def get_editable_songs(user_data):
    """
    Endpoint for getting all the songs a user may edit.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        total_songs = get_number_of_editable_songs_by_uid(user_data.get("uid"))

        songs_per_page = request.args.get('songs_per_page')
        if not songs_per_page:
            songs_per_page = 50
        songs_per_page = int(songs_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = ceil(total_songs / songs_per_page)
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
            user_data.get("uid"), start_index, songs_per_page
        )
        res = []
        for song in editable_songs:
            res.append(gen_song_object(song))

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
        user_data.get("uid"), start_index, songs_per_page
    )
    res = []
    for song in editable_songs:
        res.append(gen_song_object(song))


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
@auth_required(return_user=True)
def get_liked_songs(user_data):
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

        total_pages = ceil(total_songs / songs_per_page)
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
            uid, start_index, songs_per_page, user_data.get("uid")
        )

        res = []
        for song in liked_songs:
            res.append(gen_song_object(song))

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
        uid, start_index, songs_per_page, user_data.get("uid")
    )

    res = []
    for song in liked_songs:
        res.append(gen_song_object(song))

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
def publish_song(user_data):
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

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
        return {"message": "You can't publish that song!"}, 401

    update_published_status(1, request.json.get("sid"))
    update_publised_timestamp(
        request.json.get("sid"),
        str(datetime.datetime.utcnow())
    )

    try:
        title = get_song_data(
            request.json.get("sid"), user_data.get("uid")
        )[0][2]
    except NoResults:
        return {"message": "Song does not exist!"}, 400

    try:
        dids = []
        for did in notify_song_dids(user_data.get("uid")):
            dids += did
        message = (
            user_data.get("username") + " just dropped a new song: \""
            + title + "\""
        )
        notification_sender(message, dids, "New Song")
    except NoResults:
        pass

    return {"message": "Song published."}, 200


@AUDIO.route("/unpublish", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def unpublish_song(user_data):
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

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
        return {"message": "You can't publish that song!"}, 401

    update_published_status(0, request.json.get("sid"))
    update_publised_timestamp(request.json.get("sid"), None)

    return {"message": "Song unpublished."}, 200


@AUDIO.route("/compiled_url", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def compiled_url(user_data):
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

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
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
def cover_url(user_data):
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

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
        return {"message": "You can't update that song!"}, 401

    update_cover_url(request.json.get("sid"), request.json.get("url"))
    return {"message": "Cover URL updated."}, 200


@AUDIO.route("/playlist", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def create_a_playlist(user_data):
    """
    Endpoint for creating a playlist.
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

    pid = create_playlist(user_data.get("uid"), request.json.get("title"))

    return {"message": "Playlist created", "pid": pid}, 200


@AUDIO.route("/playlist", methods=["DELETE"])
@sql_err_catcher()
@auth_required(return_user=True)
def delete_my_playlist(user_data):
    """
    Endpoint for deleting a playlist.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "pid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["pid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    pid = request.json.get("pid")

    try:
        ownder_uid = get_playlist(pid)[0][1]
    except IndexError:
        return {"message": "Invalid pid"}, 422
    if ownder_uid != user_data.get("uid"):
        return {"message": "Not permitted to delete that playlist"}, 401

    delete_playlist_data(pid)
    delete_playlist(pid)

    return {"message": "Playlist deleted"}, 200


@AUDIO.route("/playlist", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def get_my_playlists(user_data):
    """
    Endpoint for getting all a user's playlists.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    uid = user_data.get("uid")
    if not next_page and not back_page:
        total_playlists = get_number_of_playlists(uid)

        playlists_per_page = request.args.get('playlists_per_page')
        if not playlists_per_page:
            playlists_per_page = 50
        playlists_per_page = int(playlists_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = ceil(total_playlists / playlists_per_page)
        if total_pages == 0:
            total_pages = 1
        if current_page > total_pages:
            return {
                "message": (
                    "current_page exceeds the total number of pages available("
                    + str(total_pages) + ")."
                )
            }, 422

        start_index = (current_page * playlists_per_page) - playlists_per_page

        playlists = get_playlists(uid, start_index, playlists_per_page)

        res = []
        for playlist in playlists:
            res.append(gen_playlist_object(playlist))

        jwt_payload = {
            "total_pages": total_pages,
            "playlists_per_page": playlists_per_page,
        }

        back_page, next_page = gen_scroll_tokens(
            current_page, total_pages, jwt_payload
        )

        return {
            "current_page": current_page,
            "total_pages": total_pages,
            "playlists_per_page": playlists_per_page,
            "next_page": next_page,
            "back_page": back_page,
            "playlists": res,
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
    playlists_per_page = token.get("playlists_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * playlists_per_page) - playlists_per_page

    playlists = get_playlists(uid, start_index, playlists_per_page)

    res = []
    for playlist in playlists:
        res.append(gen_playlist_object(playlist))

    jwt_payload = {
        "total_pages": total_pages,
        "playlists_per_page": playlists_per_page,
    }

    back_page, next_page = gen_scroll_tokens(
        current_page, total_pages, jwt_payload
    )

    return {
        "current_page": current_page,
        "total_pages": total_pages,
        "playlists_per_page": playlists_per_page,
        "next_page": next_page,
        "back_page": back_page,
        "playlists": res
    }, 200


@AUDIO.route("/playlist", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def rename_playlist(user_data):
    """
    Endpoint for renaming a playlist.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "pid": {
                "type": "integer",
                "minimum": 1
            },
            "title": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["pid", "title"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    pid = request.json.get("pid")

    try:
        ownder_uid = get_playlist(pid)[0][1]
    except IndexError:
        return {"message": "Invalid pid"}, 422
    if ownder_uid != user_data.get("uid"):
        return {"message": "Not permitted to rename that playlist"}, 401

    update_playlist_name(request.json.get('pid'), request.json.get('title'))
    update_playlist_timestamp(request.json.get('pid'))
    return {"message": "Playlist renamed"}, 200


@AUDIO.route("/playlist_songs", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def get_my_playlist_songs(user_data):  # pylint: disable=R0911
    """
    Endpoint for getting all the songs in a playlist.
    """
    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        pid = request.args.get('pid')
        if not pid:
            return {"message": "No PID sent"}, 422
        pid = int(pid)

        total_songs = get_number_of_songs_in_playlist(pid)

        try:
            ownder_uid = get_playlist(pid)[0][1]
        except IndexError:
            return {"message": "Invalid pid"}, 422
        if ownder_uid != user_data.get("uid"):
            return {"message": "Not permitted see that playlist"}, 401

        songs_per_page = request.args.get('songs_per_page')
        if not songs_per_page:
            songs_per_page = 50
        songs_per_page = int(songs_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = ceil(total_songs / songs_per_page)
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

        songs = get_playlist_data(
            pid, start_index, songs_per_page, user_data.get("uid")
        )

        res = []
        for song in songs:
            res.append(gen_song_object(song))

        jwt_payload = {
            "pid": pid,
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

    pid = token.get("pid")
    current_page = token.get("current_page")
    songs_per_page = token.get("songs_per_page")
    total_pages = token.get("total_pages")
    start_index = (current_page * songs_per_page) - songs_per_page

    songs = get_playlist_data(
        pid, start_index, songs_per_page, user_data.get("uid")
    )

    res = []
    for song in songs:
        res.append(gen_song_object(song))

    jwt_payload = {
        "pid": pid,
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


@AUDIO.route("/playlist_songs", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def add_song_to_playlist(user_data):  # pylint: disable=R0911
    """
    Endpoint for adding a sing to a playlist.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "pid": {
                "type": "integer",
                "minimum": 1
            },
            "sid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["pid", "sid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    try:
        ownder_uid = get_playlist(request.json.get('pid'))[0][1]
    except IndexError:
        return {"message": "Invalid pid"}, 422
    if ownder_uid != user_data.get("uid"):
        return {"message": "Not permitted to add to that playlist"}, 401

    try:
        song_data = get_song_data(
            request.json.get('sid'), user_data.get("uid")
        )[0]
        if not song_data[5] or not song_data[6]:
            return {"message": "That song is private"}, 401
    except NoResults:
        return {"message": "Invalid sid"}, 422

    try:
        get_from_playlist(request.json.get('pid'), request.json.get('sid'))
        return {"message": "Song already in playlist"}, 422
    except NoResults:
        add_to_playlist(request.json.get('pid'), request.json.get('sid'))
        update_playlist_timestamp(request.json.get('pid'))
        return {"message": "Song added"}, 200


@AUDIO.route("/playlist_songs", methods=["DELETE"])
@sql_err_catcher()
@auth_required(return_user=True)
def remove_song_from_playlist(user_data):
    """
    Endpoint for adding a sing to a playlist.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "pid": {
                "type": "integer",
                "minimum": 1
            },
            "sid": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["pid", "sid"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    try:
        ownder_uid = get_playlist(request.json.get('pid'))[0][1]
    except IndexError:
        return {"message": "Invalid pid"}, 422
    if ownder_uid != user_data.get("uid"):
        return {"message": "Not permitted to add to that playlist"}, 401

    remove_from_playlist(request.json.get('pid'), request.json.get('sid'))
    update_playlist_timestamp(request.json.get('pid'))
    return {"message": "Song removed"}, 200


@AUDIO.route("/description", methods=["PATCH"])
@sql_err_catcher()
@auth_required(return_user=True)
def description(user_data):
    """
    Endpoint for updating a songs description.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "sid": {
                "type": "integer",
                "minimum": 1
            },
            "description": {
                "type": "string",
                "minLength": 1
            }
        },
        "required": ["sid", "description"],
        "minProperties": 2
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
        return {"message": "You can't update that song!"}, 401

    update_description(
        request.json.get("sid"), request.json.get("description")
    )
    return {"message": "Description updated."}, 200


@AUDIO.route("/search", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def search_songs(user_data):  # pylint: disable=R0911,R0912,R0914,R0915
    """
    Endpoint for searching the song catalog.
    """

    next_page = request.args.get('next_page')
    back_page = request.args.get('back_page')
    if not next_page and not back_page:
        search_term = request.args.get('search_term')
        if search_term:
            total_songs = get_number_of_searchable_songs(search_term)
        else:
            total_songs = get_number_of_compiled_songs()

        publish_sort = request.args.get('publish_sort')
        title_sort = request.args.get('title_sort')
        artist_sort = request.args.get('artist_sort')
        duration_sort = request.args.get('duration_sort')

        sorts = [
            sort for sort in
            [publish_sort, title_sort, artist_sort, duration_sort]
            if sort is not None
        ]

        sort_sql = None
        if sorts:
            if len(sorts) > 1:
                return {
                    "message": "Only one sort can be applied at a time."
                }, 400

            if not isinstance(sorts[0], str):
                return {
                    "message": "Sort values, must be a str of value 'up' or "
                               "'down'"
                }, 400

            sorts[0] = sorts[0].lower()

            if sorts[0] != "up" and sorts[0] != "down":
                return {
                    "message": "Sort values, must be a str of value 'up' or "
                               "'down'"
                }, 400

            if publish_sort:
                if sorts[0] == "up":
                    sort_sql = " ORDER BY published ASC "
                else:
                    sort_sql = " ORDER BY published DESC "

            if title_sort:
                if sorts[0] == "up":
                    sort_sql = " ORDER BY title DESC "
                else:
                    sort_sql = " ORDER BY title ASC "

            if artist_sort:
                if sorts[0] == "up":
                    sort_sql = " ORDER BY username DESC "
                else:
                    sort_sql = " ORDER BY username ASC "

            if duration_sort:
                if sorts[0] == "up":
                    sort_sql = " ORDER BY duration ASC "
                else:
                    sort_sql = " ORDER BY duration DESC "

        profile_search = False
        search_my_profile = request.args.get('profile_search')
        if search_my_profile:
            profile_search = True

        songs_per_page = request.args.get('songs_per_page')
        if not songs_per_page:
            songs_per_page = 50
        songs_per_page = int(songs_per_page)

        current_page = request.args.get('current_page')
        if not current_page:
            current_page = 1
        current_page = int(current_page)

        total_pages = ceil(total_songs / songs_per_page)
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

        if search_term:
            search_results = get_all_search_results(
                start_index, songs_per_page, user_data.get("uid"), search_term,
                sort_sql, profile_search
            )
        else:
            if profile_search:
                search_results = get_all_compiled_songs_by_uid(
                    user_data.get("uid"), start_index, songs_per_page,
                    user_data.get("uid"), sort_sql
                )
            else:
                search_results = get_all_compiled_songs(
                    start_index, songs_per_page, user_data.get("uid"), sort_sql
                )

        res = []
        for song in search_results:
            res.append(gen_song_object(song))

        jwt_payload = {
            "search_term": search_term,
            "sort_sql": sort_sql,
            "total_pages": total_pages,
            "songs_per_page": songs_per_page,
            "profile_search": profile_search,
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

    search_term = token.get("search_term")
    sort_sql = token.get("sort_sql")

    current_page = token.get("current_page")
    songs_per_page = token.get("songs_per_page")
    total_pages = token.get("total_pages")
    profile_search = token.get("profile_search")
    start_index = (current_page * songs_per_page) - songs_per_page

    if search_term:
        search_results = get_all_search_results(
            start_index, songs_per_page, user_data.get("uid"), search_term,
            sort_sql, profile_search
        )
    else:
        if profile_search:
            search_results = get_all_compiled_songs_by_uid(
                user_data.get("uid"), start_index, songs_per_page,
                user_data.get("uid"), sort_sql
            )
        else:
            search_results = get_all_compiled_songs(
                start_index, songs_per_page, user_data.get("uid"), sort_sql
            )

    res = []
    for song in search_results:
        res.append(gen_song_object(song))

    jwt_payload = {
        "search_term": search_term,
        "sort_sql": sort_sql,
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


@AUDIO.route("", methods=["DELETE"])
@sql_err_catcher()
@auth_required(return_user=True)
def delete_song(user_data):
    """
    Endpoint for deleting a song.
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
        get_song_data(request.json.get("sid"), user_data.get("uid"))
    except NoResults:
        return {"message": "Song does not exist!"}, 400

    if not permitted_to_edit(request.json.get("sid"), user_data.get("uid")):
        return {"message": "You can't delete that song!"}, 401

    delete_song_data(request.json.get('sid'))

    return {"message": "Song deleted"}, 200


@AUDIO.route("/folders", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def create_folder(user_data):  # pylint: disable=R0911
    """
    Endpoint for creating a folder in the DB.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "folder_name": {
                "type": "string",
                "minLength": 1
            },
            "parent_folder_id": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["folder_name"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if request.json.get("parent_folder_id"):
        try:
            get_folder_entry(request.json.get("parent_folder_id"))
            parent_folder_id = request.json.get("parent_folder_id")
        except NoResults:
            return {
                "message": ("Invalid parent folder ID. "
                            "Folder does not exist!")
            }, 400
    else:
        parent_folder_id = get_user_via_username(
            user_data.get("username")
        )[0][-1]

    create_folder_entry(
        request.json.get("folder_name"), parent_folder_id
    )

    return {"message": "Folder created"}, 200


@AUDIO.route("/files", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def create_file(user_data):  # pylint: disable=R0911
    """
    Endpoint for creating a File in the DB.
    """
    expected_body = {
        "type": "object",
        "properties": {
            "file_name": {
                "type": "string",
                "minLength": 1
            },
            "file_url": {
                "type": "string",
                "minLength": 1
            },
            "folder_id": {
                "type": "integer",
                "minimum": 1
            }
        },
        "required": ["file_name", "file_url"]
    }
    try:
        validate(request.json, schema=expected_body)
    except ValidationError as exc:
        log("warning", "Request validation failed.", str(exc))
        return {"message": str(exc)}, 422

    if request.json.get("folder_id"):
        try:
            get_folder_entry(request.json.get("folder_id"))
            folder_id = request.json.get("folder_id")
        except NoResults:
            return {
                "message": ("Invalid parent folder ID. "
                            "Folder does not exist!")
            }, 400
    else:
        folder_id = get_user_via_username(
            user_data.get("username")
        )[0][-1]

    add_sample(
        request.json.get("file_name"),
        request.json.get("file_url"),
        folder_id
    )

    return {"message": "File added to folder"}, 200


@AUDIO.route("/folders", methods=["DELETE"])
@sql_err_catcher()
@auth_required()
def delete_folder():  # pylint: disable=R0911
    """
    Endpoint for deleting a folder in the DB.
    """
    folder_id = request.args.get('folder_id')
    if not folder_id:
        return {"message": "No folder_id sent"}, 422

    try:
        get_root_folder_entry(folder_id)
        return {"message": "You can't delete a root folder"}, 401
    except NoResults:
        delete_folder_entry(folder_id)
        return {"message": "Folder deleted"}, 200


@AUDIO.route("/files", methods=["DELETE"])
@sql_err_catcher()
@auth_required()
def delete_file():  # pylint: disable=R0911
    """
    Endpoint for deleting a file in the DB.
    """
    file_id = request.args.get('file_id')
    if not file_id:
        return {"message": "No file_id sent"}, 422

    delete_file_entry(file_id)
    return {"message": "File deleted"}, 200


@AUDIO.route("/folders", methods=["PATCH"])
@sql_err_catcher()
@auth_required()
def move_folder():  # pylint: disable=R0911
    """
    Endpoint for moving a folder in the DB.
    """
    folder_id = request.args.get('folder_id')
    if not folder_id:
        return {"message": "No folder_id sent"}, 422

    parent_folder_id = request.args.get('parent_folder_id')
    if not parent_folder_id:
        return {"message": "No parent_folder_id sent"}, 422

    try:
        get_root_folder_entry(folder_id)
        return {"message": "You can't move a root folder"}, 401
    except NoResults:
        move_folder_entry(folder_id, parent_folder_id)
        return {"message": "Folder moved"}, 200


@AUDIO.route("/files", methods=["PATCH"])
@sql_err_catcher()
@auth_required()
def move_file():  # pylint: disable=R0911
    """
    Endpoint for moving a file in the DB.
    """
    folder_id = request.args.get('folder_id')
    if not folder_id:
        return {"message": "No folder_id sent"}, 422

    file_id = request.args.get('file_id')
    if not file_id:
        return {"message": "No file_id sent"}, 422

    move_file_entry(folder_id, file_id)
    return {"message": "File moved"}, 200


@AUDIO.route("/folders", methods=["GET"])
@sql_err_catcher()
@auth_required(return_user=True)
def read_folder(user_data):  # pylint: disable=R0911
    """
    Endpoint for getting a folders contents in the DB.
    """
    res = {}

    folder_id = request.args.get('folder_id')
    if not folder_id:
        folder_id = get_user_via_username(user_data.get("username"))[0][-1]

    try:
        row = get_folder_entry(folder_id)
        res["folder_id"] = row[0][0]
        res["folder_name"] = row[0][2]
        row = get_child_folders(folder_id)
        folders = []
        for folder in row:
            folders.append(gen_folder_object(folder))
        res["child_folders"] = folders
        row = get_child_files(folder_id)
        files = []
        for file in row:
            files.append(gen_file_object(file))
        res["child_files"] = files
    except NoResults:
        return {
            "message": ("Invalid folder ID. Folder does not exist!")
        }, 400

    return {"folder": res}, 200
