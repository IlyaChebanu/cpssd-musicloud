"""
Query models for interfacing with the DB for auth related transactions.
"""
from ..utils import query
from .errors import NoResults


def insert_login(uid, access_token, time_issued):
    """
    Create a login entry.
    :param uid:
    Int - ID of the user logging in.
    :param access_token:
    Str - Raw JWT string given to the user to authenticate later with.
    :param time_issued:
    Str - Datetime string of when the user logged in.
    :return:
    None - Creates a login entry in DB and returns None.
    """
    try:
        sql = (
            "INSERT INTO Logins "
            "(uid, access_token, time_issued) "
            "VALUES (%s, %s, %s)"
        )
        args = (
            uid,
            access_token,
            time_issued,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def get_login(uid, access_token):
    """
    Get a login entry from the DB.
    :param uid:
    Int - ID of the user who's login entries we are searching.
    :param access_token:
    Str - Specific JWT string we are looking for.
    :return:
    List - Containing 1 list with the login entry in it.
    """
    try:
        sql = (
            "SELECT * FROM Logins "
            "WHERE uid = %s AND access_token = %s"
        )
        args = (
            uid,
            access_token,
        )
        login = query(sql, args, True)
        if not login:
            raise NoResults
        return login
    except Exception as exc:
        raise exc


def refresh_login(new_issue_time, uid, access_token):
    """
    Update the time_issued stored for a specific access_token.
    :param new_issue_time:
    Str - Datetime string of the current time.
    :param uid:
    Int - ID of the user who's access_token we are refreshing.
    :param access_token:
    Str - Raw JWT string who's access privileges we are extending.
    :return:
    None - Updates the time_issued in the DB and returns None.
    """
    try:
        sql = (
            "UPDATE Logins "
            "SET time_issued = %s "
            "WHERE uid = %s AND access_token = %s"
        )
        args = (
            new_issue_time,
            uid,
            access_token,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def delete_login(access_token):
    """
    Revoke an access_token's access privileges.
    :param access_token:
    Str - Raw JWT string who's access we are invalidating.
    :return:
    None - Deletes the specific login entry and returns None.
    """
    try:
        sql = (
            "DELETE FROM Logins "
            "WHERE access_token = %s"
        )
        args = (
            access_token,
        )
        query(sql, args)
    except Exception as exc:
        raise exc
