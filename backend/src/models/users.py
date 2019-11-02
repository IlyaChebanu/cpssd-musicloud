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


def get_user_via_username(username):
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


def make_post(uid, message, time_of_post):
    try:
        sql = (
            "INSERT INTO Posts "
            "(uid, message, time) "
            "VALUES (%s, %s, %s)"
        )
        args = (
            uid,
            message,
            time_of_post,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def get_follower_count(uid):
    try:
        sql = (
            "SELECT COUNT(*) FROM Followers "
            "WHERE following = %s"
        )
        args = (
            uid,
        )
        return query(sql, args, True)[0][0]
    except Exception as exc:
        raise exc


def get_following_count(uid):
    try:
        sql = (
            "SELECT COUNT(*) FROM Followers "
            "WHERE follower = %s"
        )
        args = (
            uid,
        )
        return query(sql, args, True)[0][0]
    except Exception as exc:
        raise exc


def get_song_count(uid):
    try:
        # Does not include songs the user has edit permission for.
        sql = (
            "SELECT COUNT(*) FROM Songs "
            "WHERE uid = %s"
        )
        args = (
            uid,
        )
        return query(sql, args, True)[0][0]
    except Exception as exc:
        raise exc


def get_number_of_posts(uid):
    try:
        sql = (
            "SELECT COUNT(*) FROM Posts "
            "WHERE uid = %s"
        )
        args = (
            uid,
        )
        return query(sql, args, True)[0][0]
    except Exception as exc:
        raise exc


def get_number_of_likes(uid):
    try:
        sql = (
            "SELECT COUNT(*) FROM Song_Likes "
            "WHERE uid = %s"
        )
        args = (
            uid,
        )
        return query(sql, args, True)[0][0]
    except Exception as exc:
        raise exc
