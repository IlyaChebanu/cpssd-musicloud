"""
This is were all of the API controllers are connected to the Flask server.
"""
from flask import Flask
from flask_cors import CORS

from .controllers.users.controllers import USERS
from .controllers.auth.controllers import AUTH
from .controllers.audio.controllers import AUDIO
from .controllers.s3.controllers import S3

APP = Flask(__name__)
CORS(APP)

APP.register_blueprint(USERS, url_prefix='/api/v1/users')
APP.register_blueprint(AUTH, url_prefix='/api/v1/auth')
APP.register_blueprint(AUDIO, url_prefix='/api/v1/audio')
APP.register_blueprint(S3, url_prefix='/api/v1/s3')
