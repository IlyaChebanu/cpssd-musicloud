from flask import Flask
from flask_cors import CORS

from .controllers.users.controllers import users
from .controllers.auth.controllers import auth
from .controllers.audio.controllers import audio


app = Flask(__name__)
CORS(app)

app.register_blueprint(users, url_prefix='/api/v1/users')
app.register_blueprint(auth, url_prefix='/api/v1/auth')
app.register_blueprint(audio, url_prefix='/api/v1/audio')
