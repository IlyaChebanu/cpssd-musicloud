"""
Query models for interfacing with the DB for audio related transactions.
"""
from ..utils import query
from .errors import NoResults


def insert_song(uid, title, duration, created, public):
    """
    Insert a new song into the DB.
    :param uid:
    Int - ID of the user creating the song.
    :param title:
    Str - Title of the song.
    :param duration:
    Int - Duration of the compiled song in milliseconds Defaults to 0.
    :param created:
    Str - Datetime string for the date and time of the song creation.
    :param public:
    Int - 1 if the compiled song may be viewed by other, otherwise 0.
    :return:
    Int - ID for the newly created song.
    """
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
    """
    Save a new song state for a given song.
    :param sid:
    Int - ID of the song who's state we are saving.
    :param state:
    Dict - JSON song_state object we are saving.
    :param time_updated:
    Str - Datetime string of when we inserted this new song_state.
    :return:
    None - Executes the query & returns None.
    """
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
    """
    Get all the info for a specific song.
    :param sid:
    Int - ID of the song who's information we want.
    :return:
    List - Containing 1 list with the requested songs information.
    """
    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
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
    """
    Get all the songs a user may edit.
    :param uid:
    Int - ID of the user's who's editable songs we are requesting.
    :return:
    List - Containing lists of song data.
    """
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
    """
    Check if a user may edit a song.
    :param sid:
    Int - ID of the song's who's editors we are checking.
    :param uid:
    Int - ID of the user we are checking can edit the song.
    :return:
    Int - 1 if the user may edit the song else 0.
    """
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
    """
    Get the current song_state.
    :param sid:
    Int - ID of the song who's current state we are looking to retrieve.
    :return:
    Dict - The most recently saved JSON song_state object.
    """
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
    """
    Get any publicly available song.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :return:
    List - Containing lists of song data.
    """
    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
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
    """
    Get any publicly available song for a specific user.
    :param uid:
    Int - ID of the user who's songs we are looking up.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :return:
    List - Containing lists of song data.
    """
    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
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
    """
    Get all the songs a user may edit.
    :param uid:
    Int - ID of the user who's editable songs we are looking up.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :return:
    List - Containing lists of song data.
    """
    sql = (
        "SELECT Songs.sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover,"
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid ) as likes FROM Songs "
        "WHERE uid = %s UNION SELECT "
        "Songs.sid, (SELECT username FROM Users "
        "WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover,"
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes FROM Songs INNER JOIN "
        "Song_Editors ON Song_Editors.sid = Songs.sid WHERE "
        "Song_Editors.uid = %s LIMIT %s, %s;"
    )
    args = (
        uid,
        uid,
        start_index,
        songs_per_page,
    )
    return query(sql, args, True)


def get_number_of_compiled_songs():
    """
    Return the number of all publicly available songs.
    :return:
    Int - Number of public songs in DB.
    """
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE public = 1"
    )
    return query(sql, (), True)[0][0]


def get_number_of_compiled_songs_by_uid(uid):
    """
    Return the number of all publicly available songs for a specific user.
    :param uid:
    Int - ID of the specific user we who's public songs we are searching.
    :return:
    Int - Number of public songs in DB for the specified user.
    """
    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE public = 1 AND uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_editable_songs_by_uid(uid):
    """
    Return the number of all editable songs for a specific user.
    :param uid:
    Int - ID of the specific user we who's editable songs we are searching.
    :return:
    Int - Number of editable songs in DB for the specified user.
    """
    sql = (
        "SELECT (SELECT COUNT(*) FROM Songs WHERE uid = %s) AS `count_own`,"
        "(SELECT COUNT(*) FROM Song_Editors WHERE uid = %s) AS `count_editor`"
    )
    args = (
        uid,
        uid,
    )
    res = query(sql, args, True)[0]
    return res[0] + res[1]


def is_public(sid):
    """
    Check if a specific song is public.
    :param sid:
    Int - ID of the specific we are checking is public.
    :return:
    Int - 1 if song is public else 0.
    """
    sql = (
        "SELECT public FROM Songs "
        "WHERE sid = %s"
    )
    args = (
        sid,
    )
    return query(sql, args, True)[0][0]


# Safe to disable too-many-arguments as this func is just used for DB
# population for testing.
# pylint: disable=R0913
def insert_full_song(
        sid, uid, title, duration, created, public, url, cover, genre):
    """
    Used for testing to insert a full row into the Songs table in the DB.
    :param sid:
    Int - ID of the song we are inserting.
    :param uid:
    Int - ID of the user creating the song.
    :param title:
    Str - Title of the song.
    :param duration:
    Int - Duration of the compiled song in milliseconds Defaults to 0.
    :param created:
    Str - Datetime string for the date and time of the song creation.
    :param public:
    Int - 1 if the compiled song may be viewed by other, otherwise 0.
    :param url:
    Str - URL string pointing to the compiled song. May be None.
    :param cover:
    Str - URL string pointing to the cover art picture. May be None.
    :param genre:
    Str - Comma separated string of genres the song belongs to.
    :return:
    Int - ID of the newly created song.
    """
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
    """
    Add a like entry to the DB.
    :param uid:
    Int - ID of the user creating the like.
    :param sid:
    Int - ID of the song the user is liking.
    :return:
    None - Inserts like into DB and returns None.
    """
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
    """
    Delete a like entry from the DB.
    :param uid:
    Int - ID of the user deleting the like.
    :param sid:
    Int - ID of the song the user is unliking.
    :return:
    None - Deletes like in DB and returns None.
    """
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
    """
    Add an editor for a song.
    :param sid:
    Int - ID of the song we are adding an editor too.
    :param uid:
    Int - ID of the user we are adding as an editor.
    :return:
    None - Adds editor entry to the DB and returns None.
    """
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
    """
    Return the number of all liked songs for a specific user.
    :param uid:
    Int - ID of the specific user we who's liked songs we are searching.
    :return:
    Int - Number of liked songs in DB for the specified user.
    """
    sql = (
        "SELECT COUNT(*) FROM Song_Likes WHERE uid=%s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_all_liked_songs_by_uid(uid, start_index, songs_per_page):
    """
    Get all the songs a specific user liked.
    :param uid:
    Int - ID of the user who's liked songs we are searching.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :return:
    List - Containing lists of song data.
    """
    sql = (
        "SELECT Songs.sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes FROM Songs "
        "INNER JOIN Song_Likes ON "
        "Song_Likes.sid = Songs.sid WHERE Song_Likes.uid = %s LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        songs_per_page,
    )
    return query(sql, args, True)


def get_like_pair(sid, uid):
    """
    Get a specific (song,user) like pair from the DB.
    :param sid:
    Int - ID of the song who's likes we are searching.
    :param uid:
    Int - ID of the user we are checking likes the song.
    :return:
    List - Contains 1 list with the (song,user) pair in it if the relation
    exists, otherwise it is empty.
    """
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
    """
    Change the public status for a specific song.
    :param public:
    Int - 0 for not public, 1 for public.
    :param sid:
    Int - ID of the song who's public status we are changing.
    :return:
    None - Updated public status in DB and returns None.
    """
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


def update_compiled_url(sid, url, duration):
    """
    Updates the URL link to a compiled song in the DB.
    :param sid:
    Int - ID of the song who's public status we are changing.
    :param url:
    Str - URL to the compiled version of the song we want user's to hear.
    :param duration:
    Int - Duration of the compiled song in milliseconds Defaults to 0.
    :return:
    None - Updated the compiled URL in the DB and returns None.
    """
    sql = (
        "UPDATE Songs "
        "SET url = %s AND duration = %s "
        "WHERE sid = %s"
    )
    args = (
        url,
        duration,
        sid,
    )
    query(sql, args)


def update_cover_url(sid, url):
    """
    Updates the URL link to a song's cover art in the DB.
    :param sid:
    Int - ID of the song who's cover art we are changing.
    :param url:
    Str - URL to the new cover art for the song.
    :return:
    None - Updated the cover URL in the DB and returns None.
    """
    sql = (
        "UPDATE Songs "
        "SET cover = %s "
        "WHERE sid = %s"
    )
    args = (
        url,
        sid,
    )
    query(sql, args)


def create_playlist(uid, title):
    """
    Creates a new playlist in the DB.
    :param uid:
    Int - Uid of the user creating the playlist.
    :param title:
    Str - Title of the playlist.
    :return:
    None - Creates playlist in DB and returns None.
    """
    sql = (
        "INSERT INTO Playlists "
        "(uid, title) "
        "VALUES (%s, %s)"
    )
    args = (
        uid,
        title,
    )
    row_id = query(sql, args, get_insert_row_id=True)
    if not row_id:
        raise NoResults
    return row_id


def delete_playlist(pid):
    """
    Deletes a playlist in the DB.
    :param pid:
    Int - Pid of the playlist being deleted.
    :return:
    None - Deletes the playlist in DB and returns None.
    """
    sql = (
        "DELETE FROM Playlists "
        "WHERE pid=%s"
    )
    args = (
        pid,
    )
    query(sql, args)


def delete_playlist_data(pid):
    """
    Deletes a playlists song data in the DB.
    :param pid:
    Int - Pid of the playlist who's data is being deleted.
    :return:
    None - Deletes the playlist data in DB and returns None.
    """
    sql = (
        "DELETE FROM Playlist_State "
        "WHERE pid=%s"
    )
    args = (
        pid,
    )
    query(sql, args)


def get_playlist(pid):
    """
    Get all the playlist data for a single playlist.
    :param pid:
    Int - ID of the playlist who's data we are retrieving.
    :return:
    List - Containing 1 list of playlist data.
    """
    sql = (
        "SELECT * FROM Playlists WHERE pid = %s;"
    )
    args = (
        pid,
    )
    return query(sql, args, True)


def get_playlists(uid, start_index, playlists_per_page):
    """
    Get all the playlists the selected user has created.
    :param uid:
    Int - Uid of the user who's playlists we want to get.
    :param start_index:
    Int - Represents the start index of a new page.
    :param playlists_per_page:
    Int - Represents the number of items on the new page.
    :return:
    List - Containing lists of playlist data.
    """
    sql = (
        "SELECT pid,"
        "(SELECT username FROM Users WHERE Playlists.uid=Users.uid)"
        "as usernanme, title, created, updated FROM Playlists "
        "WHERE uid = %s LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        playlists_per_page,
    )
    return query(sql, args, True)


def get_playlist_data(pid, start_index, songs_per_page):
    """
    Return all of the songs in a playlist using pagination.
    :param pid:
    Int - ID of the playlist who's songs we are returning.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :return:
    List - Contains dicts of song data.
    """
    sql = (
        "SELECT Songs.sid, "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as usernanme,"
        "title, duration, created, public, url, cover, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes FROM Songs "
        "INNER JOIN Playlist_State ON "
        "Playlist_State.sid = Songs.sid WHERE Playlist_State.pid = %s "
        "AND Songs.public = 1 LIMIT %s, %s;"
    )
    args = (
        pid,
        start_index,
        songs_per_page,
    )
    return query(sql, args, True)


def get_number_of_playlists(uid):
    """
    Return the number of all a user's playlists.
    :return:
    Int - Number of playlists a user has in DB.
    """
    sql = (
        "SELECT COUNT(*) FROM Playlists "
        "WHERE uid = %s"
    )
    args = (
        uid,
    )
    return query(sql, args, True)[0][0]


def get_number_of_songs_in_playlist(pid):
    """
    Return the number of songs in a playlist.
    :return:
    Int - Number of songs in a playlist.
    """
    sql = (
        "SELECT COUNT(*) FROM Playlist_State "
        "WHERE pid = %s"
    )
    args = (
        pid,
    )
    return query(sql, args, True)[0][0]


def add_to_playlist(pid, sid):
    """
    Add a song to a playlist in the DB.
    :param pid:
    Int - ID of the playlist we are adding a song to.
    :param sid:
    Str - ID of the song we are adding.
    :return:
    None - Adds the song to the playlist in the DB and returns None.
    """
    sql = (
        "INSERT INTO Playlist_State "
        "(pid, sid) "
        "VALUES (%s, %s)"
    )
    args = (
        pid,
        sid,
    )
    query(sql, args)


def remove_from_playlist(pid, sid):
    """
    Remove a song from a playlist in the DB.
    :param pid:
    Int - ID of the playlist we are removing a song from.
    :param sid:
    Str - ID of the song we are removing.
    :return:
    None - Removes the song from the playlist in the DB and returns None.
    """
    sql = (
        "DELETE FROM Playlist_State "
        "WHERE pid=%s AND sid=%s"
    )
    args = (
        pid,
        sid,
    )
    query(sql, args)


def get_from_playlist(pid, sid):
    """
    Get a playlist relation from the DB.
    :param pid:
    Int - ID of the playlist we are searching.
    :param sid:
    Int - ID of the song we are looking for.
    :return:
    List - Contains 1 list if the relation exists, otherwise is empty.
    """
    sql = (
        "SELECT * FROM Playlist_State WHERE pid=%s AND sid=%s"
    )
    args = (
        pid,
        sid,
    )
    res = query(sql, args, True)
    if not res:
        raise NoResults
    return res


def update_playlist_timestamp(pid):
    """
    Change the updated timestamp for a particular playlist.
    :param pid:
    Int - ID of the playlist who's timestamp we are updating.
    :return:
    None - Updates the timestamp and returns None.
    """
    sql = (
        "UPDATE Playlists "
        "SET updated=CURRENT_TIMESTAMP "
        "WHERE pid = %s"
    )
    args = (
        pid,
    )
    query(sql, args)


def update_playlist_name(pid, title):
    """
    Change the name for a particular playlist.
    :param pid:
    Int - ID of the playlist who's name we are updating.
    :param title:
    Str - The new name of our playlist.
    :return:
    None - Updates the name and returns None.
    """
    sql = (
        "UPDATE Playlists "
        "SET title=%s "
        "WHERE pid = %s"
    )
    args = (
        title,
        pid,
    )
    query(sql, args)
