from flask import Flask

from backend.src.controllers.users.controllers import users
from backend.src.controllers.auth.controllers import auth


app = Flask(__name__)

app.register_blueprint(users, url_prefix='/api/v1/users')
app.register_blueprint(auth, url_prefix='/api/v1/auth')
