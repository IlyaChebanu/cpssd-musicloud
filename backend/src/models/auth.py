from ..utils import query


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
