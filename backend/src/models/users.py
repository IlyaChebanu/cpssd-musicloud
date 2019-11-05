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


def reset_password(uid, password):
    try:
        sql = (
            "UPDATE Users "
            "SET password = %s "
            "WHERE uid = %s"
        )
        args = (
            password,
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


def get_followers(uid):
    try:
        sql = (
            "SELECT * FROM Followers "
            "WHERE following = %s"
        )
        args = (
            uid,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def get_following_pair(uid_a, uid_b):
    try:
        sql = (
            "SELECT * FROM Followers "
            "WHERE follower = %s AND following = %s"
        )
        args = (
            uid_a,
            uid_b,
        )
        return query(sql, args, True)
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


def create_reset(uid, code, time_issued):
    try:
        sql = (
            "INSERT INTO Resets "
            "(uid, code, time_issued) "
            "VALUES (%s, %s, %s)"
        )
        args = (
            uid,
            code,
            time_issued,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def get_reset_request(uid, code):
    try:
        sql = (
            "SELECT * FROM Resets "
            "WHERE uid = %s AND code = %s"
        )
        args = (
            uid,
            code,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def update_reset(time_issued, code, uid):
    try:
        sql = (
            "UPDATE Resets "
            "SET time_issued=%s, code=%s "
            "WHERE uid = %s"
        )
        args = (
            time_issued,
            code,
            uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def get_posts(uid, start_index, posts_per_page):
    try:
        sql = (
            "SELECT message, time FROM Posts "
            "WHERE uid = %s "
            "ORDER BY time DESC "
            "LIMIT %s, %s"
        )
        args = (
            uid,
            start_index,
            posts_per_page,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def post_follow(follower_uid, following_uid):
    try:
        sql = (
            "INSERT INTO Followers "
            "(follower, following) "
            "VALUES (%s, %s)"
        )
        args = (
            follower_uid,
            following_uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def post_unfollow(follower_uid, following_uid):
    try:
        sql = (
            "DELETE FROM Followers "
            "WHERE follower=%s AND following=%s"
        )
        args = (
            follower_uid,
            following_uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def delete_reset(uid):
    try:
        sql = (
            "DELETE FROM Resets "
            "WHERE uid = %s "
        )
        args = (
            uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc
