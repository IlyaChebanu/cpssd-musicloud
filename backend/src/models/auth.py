from ..utils import query
from .errors import NoResults


def insert_login(uid, access_token, time_issued):
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
