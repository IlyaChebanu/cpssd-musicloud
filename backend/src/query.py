import mysql.connector

from .config import MYSQL_CONFIG


def query(query_string, get_row=False):
    res = []
    try:
        # Open a DB connection.
        cnx = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = cnx.cursor()

        # Execute the query.
        cursor.execute(query_string)

        # Get rows if SELECT query otherwise commit changes.
        if get_row:
            res = cursor.fetchall()
        else:
            cnx.commit()

        # Close DB connection.
        cursor.close()
        cnx.close()

        # Return the result
        return res
    except mysql.connector.errors.IntegrityError:
        raise mysql.connector.errors.IntegrityError
    except Exception as e:
        print(e)
        raise Exception("MySQL unavailable.")
