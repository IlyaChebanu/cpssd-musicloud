import traceback

import mysql.connector

from .logger import log
from ..config import MYSQL_CONFIG


def query(query_string, query_args, get_row=False, get_insert_row_id=False):
    """Connects to the DB & executes the provided query."""
    res = []
    try:
        # Open a DB connection.
        cnx = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = cnx.cursor()

        # Execute the query.
        cursor.execute(query_string, query_args)

        # Get rows if SELECT query otherwise commit changes.
        if get_row:
            res = cursor.fetchall()
        elif get_insert_row_id:
            res = cursor.lastrowid
            cnx.commit()
        else:
            cnx.commit()

        # Close DB connection.
        cursor.close()
        cnx.close()

        # Return the result
        return res
    except mysql.connector.errors.IntegrityError:
        raise mysql.connector.errors.IntegrityError
    except Exception:
        log("error", "MySQL query failed", traceback.format_exc())
