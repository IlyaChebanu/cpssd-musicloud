from ..utils import query
from .errors import NoResults


def insert_user(email, username, password):
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


def get_user_via_username(username):
    sql = (
        "SELECT * FROM Users "
        "WHERE username = %s"
    )
    args = (
        username,
    )
    user = query(sql, args, True)
    if not user:
        raise NoResults
    return user


def get_user_via_email(email):
    sql = (
        "SELECT * FROM Users "
        "WHERE email = %s"
    )
    args = (
        email,
    )
    user = query(sql, args, True)
    if not user:
        raise NoResults
    return user


def verify_user(uid):
    sql = (
        "UPDATE Users "
        "SET verified = 1 "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    query(sql, args)


def reset_password(uid, password):
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


def reset_email(uid, email):
    sql = (
        "UPDATE Users "
        "SET email = %s "
        "WHERE uid = %s"
    )
    args = (
        email,
        uid,
    )
    query(sql, args)


def make_post(uid, message, time_of_post):
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


def get_follower_count(uid):
    sql = (
        "SELECT COUNT(*) FROM Followers "
        "WHERE following = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_followers(uid):
    sql = (
        "SELECT * FROM Followers "
        "WHERE following = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)


def get_following_pair(uid_a, uid_b):
    sql = (
        "SELECT * FROM Followers "
        "WHERE follower = %s AND following = %s"
    )
    args = (
        uid_a,
        uid_b,
    )
    return query(sql, args, True)


def get_following_count(uid):
    sql = (
        "SELECT COUNT(*) FROM Followers "
        "WHERE follower = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_song_count(uid):
    # Does not include songs the user has edit permission for.
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_posts(uid):
    sql = (
        "SELECT COUNT(*) FROM Posts "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_likes(uid):
    sql = (
        "SELECT COUNT(*) FROM Song_Likes "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def create_reset(uid, code, time_issued):
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


def get_reset_request(uid, code):
    sql = (
        "SELECT * FROM Resets "
        "WHERE uid = %s AND code = %s"
    )
    args = (
        uid,
        code,
    )
    reset = query(sql, args, True)
    if not reset:
        raise NoResults
    return reset


def update_reset(time_issued, code, uid):
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


def get_posts(uid, start_index, posts_per_page):
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


def post_follow(follower_uid, following_uid):
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


def post_unfollow(follower_uid, following_uid):
    sql = (
        "DELETE FROM Followers "
        "WHERE follower=%s AND following=%s"
    )
    args = (
        follower_uid,
        following_uid,
    )
    query(sql, args)


def delete_reset(uid):
    sql = (
        "DELETE FROM Resets "
        "WHERE uid = %s "
    )
    args = (
        uid,
    )
    query(sql, args)


def reset_user_verification(uid):
    sql = (
        "UPDATE Users "
        "SET verified = 0 "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    query(sql, args)
