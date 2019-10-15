from flask import Flask

from .users.controllers import users
from .auth.controllers import auth


app = Flask(__name__)

app.register_blueprint(users, url_prefix='/api/users')
app.register_blueprint(auth, url_prefix='/api/auth')
