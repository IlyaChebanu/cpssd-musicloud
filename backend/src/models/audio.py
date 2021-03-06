# pylint: disable=C0302
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


def get_song_data(sid, uid):
    """
    Get all the info for a specific song.
    :param sid:
    Int - ID of the song who's information we want.
    :return:
    List - Containing 1 list with the requested songs information.
    """
    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=%s"
        ") as likes, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=%s AND "
        "Song_Likes.uid=%s) as like_status, description FROM Songs "
        "WHERE sid=%s"
    )
    args = (
        sid,
        sid,
        uid,
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
        "SELECT state FROM Song_State "
        "WHERE sid = %s "
        "ORDER BY time_updated DESC "
    )
    args = (
        sid,
    )
    state = query(sql, args, True)
    if not state:
        return {}
    return state[0][0]


def get_all_compiled_songs(start_index, songs_per_page, uid, sort_sql=None):
    """
    Get any publicly available song.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :param uid:
    Int - Your user ID.
    :return:
    List - Containing lists of song data.
    """
    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Songs.sid = Song_Likes.sid"
        ") as likes, (SELECT COUNT(*) FROM Song_Likes WHERE "
        "Song_Likes.sid=Songs.sid "
        "AND Song_Likes.uid=%s), description,"
        "(SELECT profiler FROM Users WHERE Songs.uid=Users.uid) as profiler"
        " FROM Songs WHERE public=1 "
    )
    if sort_sql:
        sql += sort_sql + "LIMIT %s, %s;"
    else:
        sql += "LIMIT %s, %s;"
    args = (
        uid,
        start_index,
        songs_per_page
    )
    return query(sql, args, True)


def get_all_search_results(
        start_index, songs_per_page, uid, search_term, sort_sql, profile_search
):   # pylint: disable=R0913
    """
    Get all search results.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :param uid:
    Int - Your user ID.
    :param search_term:
    Str - The artist username or song title we are searching for.
    :param sort_sql:
    Str|None - If not none, is an ORDER statement to be added to the SQL.
    :param profile_search:
    Bool - True if searching your own profile.
    :return:
    List - Containing all song results from your search.
    """
    search_term = "%" + search_term + "%"

    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Songs.sid = Song_Likes.sid"
        ") as likes, (SELECT COUNT(*) FROM Song_Likes WHERE "
        "Song_Likes.sid=Songs.sid "
        "AND Song_Likes.uid=%s), description,"
        "(SELECT profiler FROM Users WHERE Songs.uid=Users.uid) as profiler"
        " FROM Songs WHERE public=1 AND (title LIKE %s OR "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) LIKE %s) "
    )

    profile_args = (
        uid,
        search_term,
        search_term,
        uid,
        start_index,
        songs_per_page
    )

    discover_args = (
        uid,
        search_term,
        search_term,
        start_index,
        songs_per_page
    )

    if sort_sql:
        if profile_search:
            sql += "AND uid=%s " + sort_sql + "LIMIT %s, %s;"

            res = query(sql, profile_args, True)
        else:
            sql += sort_sql + "LIMIT %s, %s;"
            res = query(sql, discover_args, True)
    else:
        if profile_search:
            sql += "AND uid=%s " + "LIMIT %s, %s;"
            res = query(sql, profile_args, True)
        else:
            sql += "LIMIT %s, %s;"
            res = query(sql, discover_args, True)

    return res


def get_all_compiled_songs_by_uid(
        uid, start_index, songs_per_page, my_uid, sort_sql=None
):
    """
    Get any publicly available song for a specific user.
    :param uid:
    Int - ID of the user who's songs we are looking up.
    :param start_index:
    Int - Represents the start index of a new page.
    :param songs_per_page:
    Int - Represents the number of items on the new page.
    :param my_uid:
    Int - Your user ID.
    :return:
    List - Containing lists of song data.
    """
    sql = (
        "SELECT Songs.sid,"
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover, ("
        "SELECT COUNT(*) FROM Song_Likes WHERE Songs.sid = Song_Likes.sid"
        ") as likes, (SELECT COUNT(*) FROM Song_Likes WHERE "
        "Song_Likes.sid=Songs.sid "
        "AND Song_Likes.uid=%s), description,"
        "(SELECT profiler FROM Users WHERE Songs.uid=Users.uid) as profiler"
        " FROM Songs WHERE public=1 AND "
        "uid=%s "
    )

    if sort_sql:
        sql += sort_sql + "LIMIT %s, %s;"
    else:
        sql += "LIMIT %s, %s;"

    args = (
        my_uid,
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
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover,"
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid ) as likes, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid "
        "AND Song_Likes.uid=%s) AS like_status, description, "
        "(SELECT time_updated FROM Song_State WHERE sid=Songs.sid ORDER BY "
        "time_updated DESC LIMIT 0, 1) as updated"
        " FROM Songs "
        "WHERE uid = %s UNION SELECT "
        "Songs.sid, (SELECT username FROM Users "
        "WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover,"
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid "
        "AND Song_Likes.uid=%s) AS like_status, description, "
        "(SELECT time_updated FROM Song_State WHERE sid=Songs.sid ORDER BY "
        "time_updated DESC LIMIT 0, 1) as updated"
        " FROM Songs "
        "INNER JOIN Song_Editors ON Song_Editors.sid = Songs.sid WHERE "
        "Song_Editors.uid = %s ORDER BY updated DESC LIMIT %s, %s;"
    )
    args = (
        uid,
        uid,
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


def get_number_of_searchable_songs(search_term):
    """
    Return the number of all searchable songs within the search constraints.
    :return:
    Int - Number of searchable songs in DB within the search constraints.
    """
    search_term = "%" + search_term + "%"

    sql = (
        "SELECT COUNT(*) FROM Songs "
        "WHERE public = 1 AND (title LIKE %s OR "
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) LIKE %s);"
    )
    args = (
        search_term,
        search_term
    )

    return query(sql, args, True)[0][0]


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
def insert_full_song(
        sid, uid, title, duration, created, public, url, cover, genre
):  # pylint: disable=R0913
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


def get_all_liked_songs_by_uid(uid, start_index, songs_per_page, my_uid):
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
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE Song_Likes.sid=Songs.sid "
        "AND Song_Likes.uid=%s) as like_status, description FROM Songs "
        "INNER JOIN Song_Likes ON "
        "Song_Likes.sid = Songs.sid WHERE Song_Likes.uid = %s LIMIT %s, %s;"
    )
    args = (
        my_uid,
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
        "SET url = %s, duration = %s "
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
        "as username, title, created, updated FROM Playlists "
        "WHERE uid = %s LIMIT %s, %s;"
    )
    args = (
        uid,
        start_index,
        playlists_per_page,
    )
    return query(sql, args, True)


def get_playlist_data(pid, start_index, songs_per_page, uid):
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
        "(SELECT username FROM Users WHERE Songs.uid=Users.uid) as username,"
        "title, duration, created, public, url, cover, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Songs.sid = Song_Likes.sid) as likes, "
        "(SELECT COUNT(*) FROM Song_Likes WHERE "
        "Song_Likes.sid=Songs.sid AND Song_Likes.uid=%s) , description FROM "
        "Songs INNER JOIN Playlist_State ON "
        "Playlist_State.sid = Songs.sid WHERE Playlist_State.pid = %s "
        "AND Songs.public = 1 LIMIT %s, %s;"
    )
    args = (
        uid,
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


def update_publised_timestamp(sid, timestamp):
    """
    Change the published timestamp for a particular song.
    :param sid:
    Int - ID of the song who's timestamp we are updating.
    :return:
    None - Updates the timestamp and returns None.
    """
    sql = (
        "UPDATE Songs "
        "SET published = %s "
        "WHERE sid = %s"
    )
    args = (
        timestamp,
        sid,
    )
    query(sql, args)


def notify_like_dids(sid):
    """
    Get the did's for the user who needs to be notified about a new song like.
    :param sid:
    Int - Sid of the user who's owns the liked song.
    :return:
    List - A list of dids.
    """
    sql = (
        "SELECT did FROM Notifications WHERE uid IN (SELECT uid FROM Users "
        "WHERE uid IN (SELECT uid FROM Songs WHERE sid=%s) AND "
        "silence_post_notifcation=0);"
    )
    args = (
        sid,
    )
    res = query(sql, args, True)
    if not res:
        raise NoResults
    return res


def notify_song_dids(uid):
    """
    Get the did's for every user who needs to be notified about the new song.
    :param uid:
    Int - Uid of the user who published the song.
    :return:
    List - A list of dids.
    """
    sql = (
        "SELECT did FROM Notifications WHERE uid IN (SELECT uid FROM Users "
        "WHERE uid IN (SELECT follower FROM Followers WHERE following=%s) "
        "AND silence_song_notifcation=0);"
    )
    args = (
        uid,
    )
    res = query(sql, args, True)
    if not res:
        raise NoResults
    return res


def update_song_name(title, sid):
    """
    Change the title of a song.
    :param title:
    Str - New song name.
    :param sid:
    Int - ID of the song who's name we are changing.
    :return:
    None - Updates song name in DB and returns None.
    """
    sql = (
        "UPDATE Songs "
        "SET title=%s "
        "WHERE sid = %s"
    )
    args = (
        title,
        sid,
    )
    query(sql, args)


def update_description(sid, description):
    """
    Updates a song's description in the DB.
    :param sid:
    Int - ID of the song who's description we are changing.
    :param description:
    Str - New song description
    :return:
    None - Updated the description in the DB and returns None.
    """
    sql = (
        "UPDATE Songs "
        "SET description = %s "
        "WHERE sid = %s"
    )
    args = (
        description,
        sid,
    )
    query(sql, args)


def delete_song_data(sid):
    """
    Remove a song, and all it's associated data, from the DB.
    :param sid:
    Int - ID of the song to be deleted.
    :return:
    None - Removes the song from the DB and returns None.
    """
    sql1 = (
        "DELETE FROM Playlist_State "
        "WHERE sid=%s"
    )
    sql2 = (
        "DELETE FROM Song_State "
        "WHERE sid=%s"
    )
    sql3 = (
        "DELETE FROM Song_Likes "
        "WHERE sid=%s"
    )
    sql4 = (
        "DELETE FROM Song_Editors "
        "WHERE sid=%s"
    )
    sql5 = (
        "DELETE FROM Songs "
        "WHERE sid=%s"
    )
    args = (
        sid,
    )
    query(sql1, args)
    query(sql2, args)
    query(sql3, args)
    query(sql4, args)
    query(sql5, args)


def create_folder_entry(folder_name, parent_folder_id):
    """
    Create a folder entry in the DB.
    :param folder_name:
    Str - The name of the new folder.
    :param parent_folder_id:
    Int - ID of the parent folder of the new folder.
    :return:
    None - Creates a new folder entry and returns None.
    """
    sql = "INSERT INTO Folder (parent_id, name) VALUES (%s, %s)"
    args = (parent_folder_id, folder_name,)
    query(sql, args)


def add_sample(sample_name, sample_url, folder_id):
    """
    Adds a sample to a folder.
    :param sample_name:
    Str - The name we want to give to the sample.
    :param sample_url:
    Str - The URL where the sample audio exists.
    :param folder_id:
    Int - The ID of the Folder we want to put the sample int.
    :return:
    None - Adds the sample to the folder and return None.
    """
    sql = "INSERT INTO File (folder_id, name, url) VALUES (%s, %s, %s)"
    args = (folder_id, sample_name, sample_url)
    query(sql, args)


def get_folder_entry(folder_id):
    """
    Get a folder from the DB.
    :param folder_id:
    Int - The ID of the folder we want.
    :return:
    List|None - List containing 1 row or None if Folder doesn't exist.
    """
    sql = "SELECT * FROM Folder WHERE folder_id=%s"
    args = (folder_id,)
    res = query(sql, args, True)
    if not res:
        raise NoResults
    return res


def delete_folder_entry(folder_id):
    """
    Delete a folder and it's subfolders & files from the DB.
    :param folder_id:
    Int - A folder ID for a folder you wish to delete.
    :return:
    None - The folder & subfolders and files are deleted and nothing returned.
    """
    sql = "DELETE FROM Folder WHERE folder_id=%s"
    args = (folder_id,)
    query(sql, args)


def get_root_folder_entry(folder_id):
    """
    Get a User from the DB based on there root folder ID.
    :param folder_id:
    Int - The ID of the root folder of a User.
    :return:
    List|None - List containing 1 row or None if User doesn't exist.
    """
    sql = "SELECT * FROM Users WHERE root_folder=%s"
    args = (folder_id,)
    res = query(sql, args, True)
    if not res:
        raise NoResults
    return res


def delete_file_entry(file_id):
    """
    Delete a file entry from the DB.
    :param file_id:
    Int - A file ID for a file you wish to delete.
    :return:
    None - The file is deleted and nothing returned.
    """
    sql = "DELETE FROM File WHERE file_id=%s"
    args = (file_id,)
    query(sql, args)


def move_folder_entry(folder_id, parent_folder_id):
    """
    Takes a folder ID and the ID of it's new parent folder.
    :param folder_id:
    Int - ID of the folder we want to move.
    :param parent_folder_id:
    Int - ID of the folder we want to move or folder into.
    :return:
    None - Moves the folder and return None.
    """
    sql = (
        "UPDATE Folder "
        "SET parent_id=%s "
        "WHERE folder_id = %s"
    )
    args = (
        parent_folder_id,
        folder_id,
    )
    query(sql, args)


def rename_folder_entry(folder_id, name):
    """
    Takes a folder ID and the new name we want to save for the file.
    :param folder_id:
    Int - ID of the folder we want to rename.
    :param name:
    Str - The new name we want to save for our file.
    :return:
    None - Renames the folder and returns None.
    """
    sql = (
        "UPDATE Folder "
        "SET name=%s "
        "WHERE folder_id = %s"
    )
    args = (
        name,
        folder_id,
    )
    query(sql, args)


def move_file_entry(folder_id, file_id):
    """
    Takes a file ID and the ID of it's new parent folder.
    :param folder_id:
    Int - ID of the folder we want to move our file into.
    :param file_id:
    Int - ID of the file we want to move.
    :return:
    None - Moves the file and return None.
    """
    sql = (
        "UPDATE File "
        "SET folder_id=%s "
        "WHERE file_id = %s"
    )
    args = (
        folder_id,
        file_id,
    )
    query(sql, args)


def rename_file_entry(name, file_id):
    """
    Takes a file ID and a new name for that file & updates the file in the DB.
    :param name:
    Str - The new filename.
    :param file_id:
    Int - ID of the file we want to rename.
    :return:
    None - Renames the file and return None.
    """
    sql = (
        "UPDATE File "
        "SET name=%s "
        "WHERE file_id = %s"
    )
    args = (
        name,
        file_id,
    )
    query(sql, args)


def get_child_folders(folder_id):
    """
    Get the child folders for a given folder ID.
    :param folder_id:
    Int - The ID of the folder we want to get subfolders from.
    :return:
    List|None - List containing many rows or None if no subfolders doesn't
    exist.
    """
    sql = "SELECT folder_id, name FROM Folder WHERE parent_id=%s"
    args = (folder_id,)
    return query(sql, args, True)


def get_child_files(folder_id):
    """
    Get the child files for a given folder ID.
    :param folder_id:
    Int - The ID of the folder we want to get files from.
    :return:
    List|None - List containing many rows or None if no files doesn't
    exist.
    """
    sql = "SELECT file_id, name, url FROM File WHERE folder_id=%s"
    args = (folder_id,)
    return query(sql, args, True)


def add_synth(name, uid, patch):
    """
    Adds a synth to the DB.
    :param name:
    Str - The name we want to give to the synth.
    :param patch:
    None|Dict - A dict containing the synth spec or None.
    :return:
    None - Adds the synth to the DB and return None.
    """
    sql = "INSERT INTO Synth (name, uid, patch) VALUES (%s, %s, %s)"
    args = (name, uid, patch)
    synth_id = query(sql, args, get_insert_row_id=True)
    if not synth_id:
        raise NoResults
    return synth_id


def get_synth(synth_id):
    """
    Get a synth from the DB.
    :param synth_id:
    Int - The synths ID.
    :return:
    List - Returns a list with 1 item, the synths DB row.
    """
    sql = "SELECT * FROM Synth WHERE id=%s"
    args = (synth_id,)
    res = query(sql, args, True)
    if not res:
        raise NoResults
    return res


def update_synth(synth_id, patch):
    """
    Takes a synth ID and the new patch object to update that synth with.
    :param synth_id:
    Int - ID of the synth we want to update.
    :param patch:
    Dict - New JSON dict for the synth.
    :return:
    None - Updates the synth and returns None.
    """
    sql = (
        "UPDATE Synth "
        "SET patch=%s "
        "WHERE id = %s"
    )
    args = (
        patch,
        synth_id,
    )
    query(sql, args)


def update_synth_name(synth_id, name):
    """
    Takes a synth ID and a new name to update that synth with.
    :param synth_id:
    Int - ID of the synth we want to update.
    :param  name:
    Str - New name for the synth.
    :return:
    None - Updates the synth and returns None.
    """
    sql = (
        "UPDATE Synth "
        "SET name=%s "
        "WHERE id = %s"
    )
    args = (
        name,
        synth_id,
    )
    query(sql, args)


def get_all_synths(uid):
    """
    Get all synths belonging to a user from the DB.
    :param uid:
    Int - The uid of the user who's synths we want to get.
    :return:
    List - Returns a list containing all a user's synths.
    """
    sql = "SELECT * FROM Synth WHERE uid=%s"
    args = (uid,)
    res = query(sql, args, True)
    return res


def delete_synth_entry(synth_id):
    """
    Delete a synth entry from the DB.
    :param synth_id:
    Int - A synth ID for a synth you wish to delete.
    :return:
    None - The synth is deleted and nothing returned.
    """
    sql = "DELETE FROM Synth WHERE id=%s"
    args = (synth_id,)
    query(sql, args)
