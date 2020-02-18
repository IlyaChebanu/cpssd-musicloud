"""
Utility function to create a song dictionary.
"""


def gen_song_object(song_list):
    """
    Takes in a song row from from the DB and creates a song dict.
    :param song_list:
    List - Raw song result returned from DB.
    :return:
    Dict - The input data structured in a standard dict.
    """
    return {
        "sid": song_list[0],
        "username": song_list[1],
        "title": song_list[2],
        "duration": song_list[3],
        "created": song_list[4],
        "public": song_list[5],
        "url": song_list[6],
        "cover": song_list[7],
        "likes": song_list[8],
        "like_status": song_list[9],
        "description": song_list[10]
    }
