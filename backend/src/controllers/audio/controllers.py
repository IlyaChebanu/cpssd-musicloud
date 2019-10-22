from flask import Blueprint
from flask import request
from flask import send_file
from ...config import AWS_CREDS
import boto3
from botocore.exceptions import NoCredentialsError

audio = Blueprint('audio', __name__)

# TODO - edit to provide the url with credentials to the client to directly store to s3
@audio.route("/get_access", methods=["POST"])
def get_access():
   return AWS_CREDS

# TODO - remove the endpoint, handle the logic on the client side 
@audio.route("/upload", methods=["POST"])
def audio_upload():
   f = request.files.get("song_data")
   aws_access_key = AWS_CREDS['AWSAccessKeyId']
   aws_secret = AWS_CREDS['AWSSecretKey']
   s3 = boto3.client('s3', aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret)
   try:
      f = request.files["song_data"]
      filename = f.filename
      s3.upload_fileobj(f, AWS_CREDS['Bucket'], filename)
      return {"message":"Upload successful"}
   except FileNotFoundError:
      return {"message":"File not found!"}
   except NoCredentialsError:
      return {"message":"Credentials not available"}
   except Exception as e:
      return {"message":str(e)}
