import datetime
import json

import boto3
from botocore.exceptions import NoCredentialsError
from flask import Blueprint
from flask import request
from jsonschema import validate, ValidationError
from ...config import AWS_CREDS
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher
from ...utils.logger import log
from ...utils import permitted_to_edit
from ...models.audio import insert_song, insert_song_state, get_song_state

audio = Blueprint('audio', __name__)


# TODO - edit to make use of conditions to allow usage of signed url without public
# access to the bucket
@audio.route("/signed-form-post", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def signed_form_post(user):
   expected_body = {
      "type": "object",
      "properties": {
         "dir": {
            "type": "string",
            "pattern": "^(audio|profiler|compiled_audio)$",
            "minLength": 1,
         },
         "fileName": {
            "type": "string",
            "minLength": 1
         },
         "fileType": {
            "type": "string",
            "minLength": 1,
         }
      },
      "required": ["dir", "fileName", "fileType"]
   }
   try:
      validate(request.json, schema=expected_body)
   except ValidationError as exc:
      log("warning", "Request validation failed.", str(exc))
      return {"message": str(exc)}, 422
   directory=request.json.get('dir')
   file_name=request.json.get('fileName')
   file_type=request.json.get('fileType')
   aws_access_key_id=AWS_CREDS['AWSAccessKeyId']
   aws_secret_access_key=AWS_CREDS['AWSSecretAccessKey']
   s3 = boto3.client(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key)
   url = s3.generate_presigned_post(
	Bucket='dcumusicloudbucket',
	Key=directory + "/" + str(user.get('uid')) + "_" + file_name,
	Fields={
		'Content-Type': file_type,
	},
        # Conditions=[
        #   {"acl": "public-read"},
        # ],
	ExpiresIn=120)
   return {"message": "Signed url for file uploading has been provided", "signed_url": url}, 200

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
