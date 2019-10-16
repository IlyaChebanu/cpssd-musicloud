import mysql.connector
from flask import request
from flask import Blueprint

from ..mysql_config import MYSQL_CONFIG

audios = Blueprint('audios', __name__)

@audios.route('/upload', methods=["POST"])
def index():
	expected_keys = ['song_name', 'song_data']
	if all(k in request.form for k in expected_keys):
		for k in expected_keys:
			if len(request.form.get(k)) == 0:
				return {"message": "Some info is missing from your request."}, 400
		try:
			cnx = mysql.connector.connect(**MYSQL_CONFIG)
			cursor = cnx.cursor()
			# Form & execute our DB query.
			query = (
				"INSERT INTO Songs "
				"(sid, title, url)"
			)
			query_data = (
				1,
				request.form.get("title"),
				request.form.get("url"),
			)
			try:
				cursor.execute(query, query_data)
			except mysql.connector.errors.IntegrityError:
				return {"message":"song id is already taken."}, 400
			cnx.commit()

			# Close DB connection.
			cursor.close()
			cnx.close()
		except:
			return {"message":"MySQL unavailable."}, 503
		return {"message": "Song entry added to the database"}
	else:
		return {"message": "Some info is missing from your request."}, 400

