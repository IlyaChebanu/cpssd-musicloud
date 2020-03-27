"""
General function for handling MySQL queries.
"""
import traceback

import mysql.connector

from .logger import log
from ..config import MYSQL_CONFIG


def query(
        query_string, query_args, get_row=False, get_insert_row_id=False,
        multi=False):
    """
    Connects to the DB & executes the provided query.
    :param query_string:
    Str defining a specific SQL query.
    :param query_args:
    Tuple containing all the arguments to populate %s tokens in the query.
    :param get_row:
    Bool True if we want to return rows selected from the DB.
    :param get_insert_row_id:
    Bool True if we want to get the ID of the row we just inserted.
    :param multi:
    Bool True if we want to execute multiple statements in one query.
    :return:
    [] - If get_row && get_insert_row_id == False
    Int - If get_insert_row_id == True && get_row == False
    [[row1contents],...] - If get_row == True
    """
    res = []
    try:
        # Open a DB connection.
        cnx = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = cnx.cursor()

        # Execute the query.
        cursor.execute(query_string, query_args, multi=multi)

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
    except mysql.connector.Error:
        log("error", "MySQL query failed", traceback.format_exc())
