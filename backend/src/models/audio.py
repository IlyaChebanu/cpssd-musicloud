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


def get_song(sid):
    sql = (
        "SELECT * FROM Songs "
        "WHERE sid = %s "
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


def editable(sid, uid):
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
