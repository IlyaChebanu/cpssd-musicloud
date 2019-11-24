from ..utils import query
from .errors import NoResults


def insert_song(uid, title, duration, created, public):
    sql = (
        "INSERT INTO Songs "
        "(uid, title, duration, created, public) "
        "VALUES (%s, %s, %s, %s, %s)"
    )
    args = (
        uid,
        title,
        duration,
        created,
        public,
    )
    row_id = query(sql, args, get_insert_row_id=True)
    if not row_id:
        raise NoResults
    return row_id


def insert_song_state(sid, state, time_updated):
    sql = (
        "INSERT INTO Song_State "
        "(sid, state, time_updated) "
        "VALUES (%s, %s, %s)"
    )
    args = (
        sid,
        state,
        time_updated,
    )
    query(sql, args)


def get_song_data(sid):
    sql = (
        "SELECT Songs.sid, (SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=%s"
        ") as likes FROM Songs WHERE sid=%s"
    )
    args = (
        sid,
        sid,
    )
    song = query(sql, args, True)
    if not song:
        raise NoResults
    return song


def get_editable_song_ids(uid):
    sql = (
        "SELECT * FROM Song_Editors "
        "WHERE uid = %s "
    )
    args = (
        uid,
    )
    songs = query(sql, args, True)
    if not songs:
        raise NoResults
    return songs


def is_editor(sid, uid):
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE sid = %s AND uid = %s "
    )
    args = (
        sid,
        uid,
    )
    count = query(sql, args, True)[0][0]
    if count == 0:
        sql = (
            "SELECT COUNT(*) FROM Song_Editors "
            "WHERE sid = %s AND uid = %s "
        )
        args = (
            sid,
            uid,
        )
        count = query(sql, args, True)[0][0]
    return count


def get_song_state(sid):
    sql = (
        "SELECT * FROM Song_State "
        "WHERE sid = %s "
        "ORDER BY time_updated DESC "
    )
    args = (
        sid,
    )
    state = query(sql, args, True)
    if not state:
        return {}
    return state[0][1]


def get_all_compiled_songs(start_index, songs_per_page):
    sql = (
        "SELECT Songs.sid, (SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Songs.sid = Song_Likes.sid"
        ") as likes FROM Songs WHERE public=1 LIMIT %s, %s;"
    )
    args = (
        start_index,
        songs_per_page
    )
    return query(sql, args, True)


def get_all_compiled_songs_by_uid(uid, start_index, songs_per_page):
    sql = (
        "SELECT Songs.sid, (SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Songs.sid = Song_Likes.sid"
        ") as likes FROM Songs WHERE public=1 AND uid=%s LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        songs_per_page

    )
    return query(sql, args, True)


def get_all_editable_songs_by_uid(uid, start_index, songs_per_page):
    sql = (
        "SELECT Songs.sid, (SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, (SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid ) as likes FROM Songs WHERE uid = %s UNION SELECT "
        "Songs.sid, (SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, (SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes FROM Songs INNER JOIN Song_Editors ON "
        "Song_Editors.sid = Songs.sid WHERE Song_Editors.uid = %s LIMIT %s, %s;"
    )
    args = (
        uid,
        uid,
        start_index,
        songs_per_page,
    )
    return query(sql, args, True)


def get_number_of_compiled_songs():
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE public = 1"
    )
    return query(sql, (), True)[0][0]


def get_number_of_compiled_songs_by_uid(uid):
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE public = 1 AND uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_editable_songs_by_uid(uid):
    sql = (
        "SELECT (SELECT COUNT(*) FROM Songs WHERE uid = %s) AS `count_own`,"
        "(SELECT COUNT(*) FROM Song_Editors WHERE uid = %s) AS `count_editor`"
    )
    args = (
        uid,
        uid,
    )
    res=query(sql, args, True)[0]
    return res[0] + res[1]


def is_public(sid):
    sql = (
        "SELECT public FROM Songs "
        "WHERE sid = %s"
    )
    args = (
        sid,
    )
    return query(sql, args, True)[0][0]


def insert_full_song(sid, uid, title, duration, created, public, url, cover, genre):
    sql = (
        "INSERT INTO Songs "
        "(sid, uid, title, duration, created, public, url, cover, genre) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    )
    args = (
        sid,
        uid,
        title,
        duration,
        created,
        public,
        url,
        cover,
        genre,
    )
    row_id = query(sql, args, get_insert_row_id=True)
    if not row_id:
        raise NoResults
    return row_id


def post_like(uid, sid):
    sql = (
        "INSERT INTO Song_Likes "
        "(uid, sid) "
        "VALUES (%s, %s)"
    )
    args = (
        uid,
        sid,
    )
    query(sql, args)


def post_unlike(uid, sid):
    sql = (
        "DELETE FROM Song_Likes "
        "WHERE uid=%s AND sid=%s"
    )
    args = (
        uid,
        sid,
    )
    query(sql, args)


def insert_editor(sid, uid):
    sql = (
        "INSERT INTO Song_Editors "
        "(sid, uid) "
        "VALUES (%s, %s)"
    )
    args = (
        sid,
        uid,
    )
    query(sql, args)


def get_number_of_liked_songs_by_uid(uid):
    sql = (
        "SELECT COUNT(*) FROM Song_Likes WHERE uid=%s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_all_liked_songs_by_uid(uid, start_index, songs_per_page):
    sql = (
        "SELECT Songs.sid, (SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, (SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes FROM Songs INNER JOIN Song_Likes ON "
        "Song_Likes.sid = Songs.sid WHERE Song_Likes.uid = %s LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        songs_per_page,
    )
    return query(sql, args, True)


def get_like_pair(sid, uid):
    sql = (
        "SELECT * FROM Song_Likes "
        "WHERE sid = %s AND uid = %s"
    )
    args = (
        sid,
        uid,
    )
    return query(sql, args, True)


def update_published_status(public, sid):
    sql = (
        "UPDATE Songs "
        "SET public=%s "
        "WHERE sid = %s"
    )
    args = (
        public,
        sid,
    )
    query(sql, args)
