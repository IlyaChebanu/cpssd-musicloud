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
        "SELECT * FROM Songs "
        "WHERE sid = %s AND public = 1"
    )
    args = (
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
        "SELECT * FROM Songs "
        "WHERE public = 1 "
        "LIMIT %s, %s"
    )
    args = (
        start_index,
        songs_per_page
    )
    return query(sql, args, True)


def get_all_compiled_songs_by_uid(uid, start_index, songs_per_page):
    sql = (
        "SELECT * FROM Songs "
        "WHERE public = 1 AND uid = %s "
        "LIMIT %s, %s"
    )
    args = (
        uid,
        start_index,
        songs_per_page
    )
    return query(sql, args, True)


def get_all_uncompiled_songs_by_uid(uid, start_index, songs_per_page):
    sql = (
        "SELECT * FROM Songs "
        "WHERE public = 0 AND uid = %s "
        "LIMIT %s, %s"
    )
    args = (
        uid,
        start_index,
        songs_per_page
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


def get_number_of_uncompiled_songs_by_uid(uid):
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE public = 0 AND uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


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
  