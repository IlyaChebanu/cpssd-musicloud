"""
/s3 API controller code.
"""
import boto3
from flask import Blueprint, request
from jsonschema import validate, ValidationError
from ...config import AWS_CREDS
from ...middleware.auth_required import auth_required
from ...middleware.sql_err_catcher import sql_err_catcher
from ...utils.logger import log

S3 = Blueprint('s3', __name__)

# TODO - edit to make use of conditions to allow signed url with private bucket
@S3.route("/signed-form-post", methods=["POST"])
@sql_err_catcher()
@auth_required(return_user=True)
def signed_form_post(user):
    """
    Endpoint to access the S3 bucket.
    """
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

    directory = request.json.get('dir')
    file_name = request.json.get('fileName')
    file_type = request.json.get('fileType')

    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_CREDS['AWSAccessKeyId'],
        aws_secret_access_key=AWS_CREDS['AWSSecretAccessKey']
    )

    url = s3_client.generate_presigned_post(
        Bucket=AWS_CREDS['Bucket'],
        Key=directory + "/" + str(user.get('uid')) + "_" + file_name,
        Fields={
            'Content-Type': file_type,
        },
        ExpiresIn=120
    )

    return {
        "message": "Signed url for file uploading has been provided",
        "signed_url": url
    }, 200
