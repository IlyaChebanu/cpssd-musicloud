"""
Utility function to create a playlist dictionary.
"""


def gen_playlist_object(playlist):
    """
    Takes in a playlist row from from the DB and creates a playlist dict.
    :param playlist:
    List - Raw playlist result returned from DB.
    :return:
    Dict - The input data structured in a standard dict.
    """
    return {
        "pid": playlist[0],
        "username": playlist[1],
        "title": playlist[2],
        "created": playlist[3],
        "updated": playlist[4]
    }
