import mysql.connector
from flask import Blueprint
from flask import request


auth = Blueprint('auth', __name__)


@auth.route('/verify')
def index():
	return {"message": "Verified."}
