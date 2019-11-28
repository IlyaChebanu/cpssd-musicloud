"""
This is were all of the API controllers are connected to the Flask server.
"""
from flask import Flask
from flask_cors import CORS

from .controllers.users.controllers import users
from .controllers.auth.controllers import auth
from .controllers.audio.controllers import audio
from .controllers.s3.controllers import s3

APP = Flask(__name__)
CORS(APP)

APP.register_blueprint(users, url_prefix='/api/v1/users')
APP.register_blueprint(auth, url_prefix='/api/v1/auth')
APP.register_blueprint(audio, url_prefix='/api/v1/audio')
APP.register_blueprint(s3, url_prefix='/api/v1/s3')
