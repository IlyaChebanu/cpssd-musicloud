from ..utils import query


def insert_user(email, username, password):
    try:
        sql = (
            "INSERT INTO Users "
            "(email, username, password, verified) "
            "VALUES (%s, %s, %s, %s)"
        )
        args = (
            email,
            username,
            password,
            0,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def get_user(username):
    try:
        sql = (
            "SELECT * FROM Users "
            "WHERE username = %s"
        )
        args = (
            username,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def get_user_via_email(email):
    try:
        sql = (
            "SELECT * FROM Users "
            "WHERE email = %s"
        )
        args = (
            email,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def verify_user(uid):
    try:
        sql = (
            "UPDATE Users "
            "SET verified = 1 "
            "WHERE uid = %s"
        )
        args = (
            uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc
