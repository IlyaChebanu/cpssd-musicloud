"""
Query models for interfacing with the DB for user related transactions.
"""
from ..utils import query
from .errors import NoResults


def insert_user(email, username, password):
    """
    Add a new user to the DB.
    :param email:
    Str - A valid email string belonging to the new user.
    :param username:
    Str - A unique username for the new user.
    :param password:
    Str - A hashed & salted password for the new user.
    :return:
    None - Inserts new user into DB & returns None.
    """
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
    """
    Get a user's info using there username.
    :param username:
    Str - The username of the user you are searching for.
    :return:
    List - Contains 1 list which contains the searched user's info.
    """
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
    """
    Get a user's info using there email address.
    :param email:
    Str - The email of the user you are searching for.
    :return:
    List - Contains 1 list which contains the searched user's info.
    """
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


def get_user_via_uid(uid):
    """
    Get a user's info using there uid.
    :param uid:
    Int - The uid of the user you are searching for.
    :return:
    List - Contains 1 list which contains the searched user's info.
    """
    sql = (
        "SELECT * FROM Users "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    user = query(sql, args, True)
    if not user:
        raise NoResults
    return user


def verify_user(uid):
    """
    Update the specific user's verified status to True.
    :param uid:
    Int - Uid of the user you wish to verify.
    :return:
    None - Updates the user's verified statue and returns None.
    """
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
    """
    Change the password hash for a given user.
    :param uid:
    Int - Uid of the user who's password hash we are changing.
    :param password:
    Str - A new hashed & salted password for the desired user.
    :return:
    None - Updates the user's password hash in the DB and returns None.
    """
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
    """
    Change the email hash for a given user.
    :param uid:
    Int - Uid of the user who's email we are changing.
    :param email:
    Str - A new valid email string for the desired user.
    :return:
    None - Updates the user's email in the DB and returns None.
    """
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
    """
    Create a post entry in the DB.
    :param uid:
    Int - Uid of the user who's creating the post.
    :param message:
    Str - Message text of the post.
    :param time_of_post:
    Str - Datetime string from when the post was made.
    :return:
    None - Creates post entry in DB and returns None.
    """
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
    """
    Get the number of followers for a specific user.
    :param uid:
    Int - Uid of the user who's followers we are counting.
    :return:
    Int - Number of followers for the specified user.
    """
    sql = (
        "SELECT COUNT(*) FROM Followers "
        "WHERE following = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_followers(uid):
    """
    Get the uid's of all the user's the desired user follows.
    :param uid:
    Int - Uid of the user who's followers we are selecting.
    :return:
    List - Lists of (follower, _) pairs.
    """
    sql = (
        "SELECT * FROM Followers "
        "WHERE following = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)


def get_following_pair(uid_a, uid_b):
    """
    Get a specific follow relation from the DB.
    :param uid_a:
    Int - Uid of the user who is the follower.
    :param uid_b:
    Int - Uid of the user who is being followed.
    :return:
    List - Empty if follow relation doesn't exists, else contains 1 list with,
    user a's uid & user b's uid.
    """
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
    """
    Get the number of followings for a specific user.
    :param uid:
    Int - Uid of the user who's followings we are counting.
    :return:
    Int - Number of followings for the specified user.
    """
    sql = (
        "SELECT COUNT(*) FROM Followers "
        "WHERE follower = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_song_count(uid):
    """
    Get the number of songs a specific user has created.
    Does not include songs the user has edit permission for.
    :param uid:
    Int - Uid of the user who's songs we are counting.
    :return:
    Int - Number of songs the specified user has created.
    """
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_posts(uid):
    """
    Get the number of posts a specific user has created.
    :param uid:
    Int - Uid of the user who's posts we are counting.
    :return:
    Int - Number of posts the specified user has created.
    """
    sql = (
        "SELECT COUNT(*) FROM Posts "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_likes(uid):
    """
    Get the number of songs a specific user has liked.
    :param uid:
    Int - Uid of the user who's likes we are counting.
    :return:
    Int - Number of songs the specified user has liked.
    """
    sql = (
        "SELECT COUNT(*) FROM Song_Likes "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def create_reset(uid, code, time_issued):
    """
    Create a password reset code DB entry.
    :param uid:
    Int - Uid of the user who has requested the password reset.
    :param code:
    Int - 8 digit reset code.
    :param time_issued:
    Str - Datetime string of when the reset code was issued.
    :return:
    None - Creates the reset DB entry and returns None.
    """
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
    """
    Get a reset request for a specific code & user.
    :param uid:
    Int - Uid of the user who's resets we are searching.
    :param code:
    Int - 8 digit reset code.
    :return:
    List - Contains 1 list with the reset information in it.
    """
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
    """
    Update a specific reset request.
    :param time_issued:
    Int - Datetime string of when the new reset code was issued.
    :param code:
    Int - 8 digit reset code.
    :param uid:
    Int - Uid of the user who's reset we are refreshing.
    :return:
    None - Updates the user's reset request in the DB and returns None.
    """
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
    """
    Get a user's posts with pagination.
    :param uid:
    Int - Uid of the user who's posts we are searching.
    :param start_index:
    Int - Start index for the current page.
    :param posts_per_page:
    Int - Amount of items to return on this page.
    :return:
    List - Contains lists of post data.
    """
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
    """
    Create a new follow relationship in the DB.
    :param follower_uid:
    Int - Uid of the user who is following.
    :param following_uid:
    Int - Uid of the user being followed.
    :return:
    None - Add the new follow relation to the DB & returns None.
    """
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
    """
    Delete a follow relationship in the DB.
    :param follower_uid:
    Int - Uid of the user who is following.
    :param following_uid:
    Int - Uid of the user being followed.
    :return:
    None - Deletes follow relation from the DB & returns None.
    """
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
    """
    Delete all a user's reset instances from the DB.
    :param uid:
    Int - Uid of the user who's reset requests we are deleting.
    :return:
    None - Deletes all a user's reset requests and returns None.
    """
    sql = (
        "DELETE FROM Resets "
        "WHERE uid = %s "
    )
    args = (
        uid,
    )
    query(sql, args)


def reset_user_verification(uid):
    """
    Revoke a user's verification.
    :param uid:
    Int - Uid of the user who's verification we are revoking.
    :return:
    None - Sets a user's verification in DB to False and returns None.
    """
    sql = (
        "UPDATE Users "
        "SET verified = 0 "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    query(sql, args)


def update_profiler_url(uid, url):
    """
    Update the URL for a user's profile picture.
    :param uid:
    Int - Uid of the user who's profiler we are updating.
    :param url:
    Str - A valid URL string pointing to the new profile image.
    :return:
    None - Updates the profiler URL in the DB for the specified user and
    returns None.
    """
    sql = (
        "UPDATE Users "
        "SET profiler = %s "
        "WHERE uid = %s"
    )
    args = (
        url,
        uid,
    )
    query(sql, args)


# Safe to disable too-many-arguments as this func is just used for DB
# population for testing.
# pylint: disable=R0913
def insert_full_user_data(uid, email, username, password, verified, profiler):
    """
    Used in dummy DB population to insert a full user row in the DB.
    :param uid:
    Int - Uid of the new user.
    :param email:
    Str - Email string for the new user.
    :param username:
    Str - Username for the new user.
    :param password:
    Str - Password hash for the new user.
    :param verified:
    Int - 1 for a verified user else 0.
    :param profiler:
    Str - URL pointing to a profile picture.
    :return:
    None - Inserts the new user and returns None.
    """
    sql = (
        "INSERT INTO Users "
        "(uid, email, username, password, verified, profiler) "
        "VALUES (%s, %s, %s, %s, %s, %s)"
    )
    args = (
        uid,
        email,
        username,
        password,
        verified,
        profiler,
    )
    query(sql, args)


def get_following_names(fid, start_index, users_per_page):
    """
    Get the info for all the user's a specific user follows.
    :param fid:
    Int - Uid of the user who's followings we are searching for.
    :param start_index:
    Int - Start index for the page.
    :param users_per_page:
    Int - Number of users that will be returned.
    :return:
    List - Contains lists of user data & reverse follow relation info.
    """
    sql = (
        "SELECT username, profiler, ("
        "SELECT COUNT(*) FROM Followers WHERE follower=uid AND following=%s"
        ") as follow_back FROM Users "
        "INNER JOIN Followers ON uid=following "
        "WHERE follower=%s "
        "LIMIT %s, %s;"
    )
    args = (
        fid,
        fid,
        start_index,
        users_per_page,
    )
    return query(sql, args, True)


def get_follower_names(fid, start_index, users_per_page):
    """
    Get the info for all the followers for a specific user.
    :param fid:
    Int - Uid of the user who's followers we are searching for.
    :param start_index:
    Int - Start index for the page.
    :param users_per_page:
    Int - Number of users that will be returned.
    :return:
    List - Contains lists of user data & reverse follow relation info.
    """
    sql = (
        "SELECT username, profiler, ("
        "SELECT COUNT(*) FROM Followers WHERE following=uid AND follower=%s"
        ") as follow_back FROM Users "
        "INNER JOIN Followers ON uid=follower "
        "WHERE following=%s "
        "LIMIT %s, %s;"
    )
    args = (
        fid,
        fid,
        start_index,
        users_per_page,
    )
    return query(sql, args, True)


def get_timeline(uid, start_index, items_per_page):
    """
    Creates a timeline list from the user's following data.
    :param uid:
    Int - Uid of the user who's timeline we want.
    :param start_index:
    Int - Start index for the page.
    :param items_per_page:
    Int - Number of items that will be returned.
    :return:
    List - Contains lists of song & post data in reverse chronological order
    from user's the selected user follows.
    """
    sql = (
        "SELECT * FROM ((SELECT sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme"
        ", title, duration, created, public,"
        "published AS time, url, cover, NULL AS message, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid ) "
        "as likes, 'song' AS type FROM "
        "Songs WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        " AND public=1) UNION (SELECT NULL AS sid, "
        "(SELECT username FROM Users WHERE Posts.uid=Users.uid) as usernanme"
        ", NULL AS title,"
        "NULL AS duration, NULL AS created, NULL AS public, time, NULL AS url,"
        "NULL AS cover, message, NULL AS likes, 'post' AS type FROM Posts "
        "WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        ")) AS Sp ORDER BY `time` DESC LIMIT %s, %s;"
    )
    args = (
        uid,
        uid,
        start_index,
        items_per_page,
    )
    res = query(sql, args, True)
    if not res:
        return []
    return res


def get_timeline_length(uid):
    """
    Return the length of a user's timeline
    :param uid:
    Int - Uid of the user who's timeline we are interested in.
    :return:
    Int - Number of items in that list.
    """
    sql = (
        "SELECT COUNT(*) FROM ((SELECT sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme"
        ", title, duration, created, public,"
        "published AS time, url, cover, NULL AS message, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid ) "
        "as likes, 'song' AS type FROM "
        "Songs WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        " AND public=1) UNION (SELECT NULL AS sid, "
        "(SELECT username FROM Users WHERE Posts.uid=Users.uid) as usernanme"
        ", NULL AS title,"
        "NULL AS duration, NULL AS created, NULL AS public, time, NULL AS url,"
        "NULL AS cover, message, NULL AS likes, 'post' AS type FROM Posts "
        "WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        ")) AS Sp ORDER BY `time` DESC;"
    )
    args = (
        uid,
        uid,
    )
    res = query(sql, args, True)
    if not res:
        return 0
    return res[0][0]


def get_timeline_posts_only(uid, start_index, items_per_page):
    """
    Creates a post only timeline list from the user's following data.
    :param uid:
    Int - Uid of the user who's timeline we want.
    :param start_index:
    Int - Start index for the page.
    :param items_per_page:
    Int - Number of items that will be returned.
    :return:
    List - Contains lists of post data in reverse chronological order
    from user's the selected user follows.
    """
    sql = (
        "SELECT * FROM ((SELECT NULL AS sid, "
        "(SELECT username FROM Users WHERE Posts.uid=Users.uid) as usernanme"
        ", NULL AS title,"
        "NULL AS duration, NULL AS created, NULL AS public, time, NULL AS url,"
        "NULL AS cover, message, NULL AS likes, 'post' AS type FROM Posts "
        "WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        ")) AS Sp ORDER BY `time` DESC LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        items_per_page,
    )
    res = query(sql, args, True)
    if not res:
        return []
    return res


def get_timeline_posts_only_length(uid):
    """
    Return the length of a user's post only timeline
    :param uid:
    Int - Uid of the user who's timeline we are interested in.
    :return:
    Int - Number of items in that list.
    """
    sql = (
        "SELECT COUNT(*) FROM ((SELECT NULL AS sid, "
        "(SELECT username FROM Users WHERE Posts.uid=Users.uid) as usernanme"
        ", NULL AS title,"
        "NULL AS duration, NULL AS created, NULL AS public, time, NULL AS url,"
        "NULL AS cover, message, NULL AS likes, 'post' AS type FROM Posts "
        "WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        ")) AS Sp ORDER BY `time` DESC;"
    )
    args = (
        uid,
    )
    res = query(sql, args, True)
    if not res:
        return 0
    return res[0][0]


def get_timeline_song_only(uid, start_index, items_per_page):
    """
    Creates a song only timeline list from the user's following data.
    :param uid:
    Int - Uid of the user who's timeline we want.
    :param start_index:
    Int - Start index for the page.
    :param items_per_page:
    Int - Number of items that will be returned.
    :return:
    List - Contains lists of song data in reverse chronological order
    from user's the selected user follows.
    """
    sql = (
        "SELECT * FROM ((SELECT sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme"
        ", title, duration, created, public,"
        "published AS time, url, cover, NULL AS message, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid ) "
        "as likes, 'song' AS type FROM "
        "Songs WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        " AND public=1)) AS Sp ORDER BY `time` DESC LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        items_per_page,
    )
    res = query(sql, args, True)
    if not res:
        return []
    return res


def get_timeline_song_only_length(uid):
    """
    Return the length of a user's song only timeline
    :param uid:
    Int - Uid of the user who's timeline we are interested in.
    :return:
    Int - Number of items in that list.
    """
    sql = (
        "SELECT COUNT(*) FROM ((SELECT sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme"
        ", title, duration, created, public,"
        "published AS time, url, cover, NULL AS message, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid ) "
        "as likes, 'song' AS type FROM "
        "Songs WHERE uid IN "
        "(SELECT Followers.following FROM Followers WHERE follower=%s)"
        " AND public=1)) AS Sp ORDER BY `time` DESC;"
    )
    args = (
        uid,
    )
    res = query(sql, args, True)
    if not res:
        return 0
    return res[0][0]
