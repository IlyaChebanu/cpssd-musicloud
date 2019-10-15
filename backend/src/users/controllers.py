import re

import bcrypt
import mysql.connector
from flask import Blueprint
from flask import request

from ..mysql_config import MYSQL_CONFIG

users = Blueprint('users', __name__)


@users.route('/', methods=["POST"])
def index():
	expected_keys = ['username', 'email', 'password']
	# Check req body is correctly formed.
	if all(k in request.form for k in expected_keys):
		for k in expected_keys:
			if len(request.form.get(k)) == 0:
				return {"message": "Some info is missing from your request."}, 400
		try:
			password_hash = bcrypt.hashpw(
				request.form.get("password").encode("utf-8"),
				bcrypt.gensalt()
			).decode("utf-8")
		except:
			return {"message": "Error while hashing password."}, 500

		# Verify that the email field is a valid email address str.
		if not re.match(r"[^@]+@[^@]+\.[^@]+", request.form.get("email")):
			return {"message": "Invalid email address"}, 400

		try:
			# Open a DB connection.
			cnx = mysql.connector.connect(**MYSQL_CONFIG)
			cursor = cnx.cursor()

			# Form & execute our DB query.
			query = (
				"INSERT INTO Users "
				"(email, username, password, verified)"
				"VALUES (%s, %s, %s, %s)"
			)
			query_data = (
				request.form.get("email"),
				request.form.get("username"),
				password_hash,
				0
			)

			try:
				cursor.execute(query, query_data)
			except mysql.connector.errors.IntegrityError:
				return {"message": "Username already taken."}, 400

			# Make sure data is committed to the database.
			cnx.commit()

			# Close DB connection.
			cursor.close()
			cnx.close()
		except:
			return {"message": "MySQL unavailable."}, 503
		return {"message": "User created!"}
	else:
		return {"message": "Some info is missing from your request."}, 400
