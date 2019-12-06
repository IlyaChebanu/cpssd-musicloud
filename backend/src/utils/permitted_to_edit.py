"""
Function to determine if a user has permission to edit a song.
"""
from ..models.audio import is_editor


def permitted_to_edit(sid, uid):
    """
    Function to determine if a user has permission to edit a song.
    :param sid:
    Int ID for the song who's permissions we are checking.
    :param uid:
    Int ID for the user who we are is permitted to edit this specific song.
    :return:
    Bool True if the user may edit the song, otherwise False.
    """
    return bool(is_editor(sid, uid))
