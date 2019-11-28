"""
Query models for interfacing with the DB for verification related transactions.
"""
from ..utils import query


def insert_verification(code, uid):
    """
    Create a new verification entry in DB.
    :param code:
    Str - 64 char random string used to verify a user's email.
    :param uid:
    Int - Uid of the user who generated the verification entry.
    :return:
    None - Creates the verification instance in the DB & returns None.
    """
    try:
        sql = (
            "INSERT INTO Verification "
            "(code, uid)"
            "VALUES (%s, %s)"
        )
        args = (
            code,
            uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc


def get_verification(uid):
    """
    Get all the verification instances in the DB for a given user.
    :param uid:
    Int - Uid of the user who's verification instance we are searching.
    :return:
    List - Contains lists of verification instances.
    """
    try:
        sql = (
            "SELECT * FROM Verification "
            "WHERE uid = %d"
        )
        args = (
            uid,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def get_verification_by_code(code):
    """
    Gets all verification instances that use the provided code.
    :param code:
    Str - 64 char code we are searching for in DB.
    :return:
    List - Contains lists of verification instances.
    """
    try:
        sql = (
            "SELECT * FROM Verification "
            "WHERE code = %s"
        )
        args = (
            code,
        )
        return query(sql, args, True)
    except Exception as exc:
        raise exc


def delete_verification(code, uid):
    """
    Remove a specific verification instance from the DB.
    :param code:
    Str - 64 char random string used to verify a user's email.
    :param uid:
    Int - Uid of the user who generated the verification entry.
    :return:
    None - Deletes the verification instance in the DB & returns None.
    """
    try:
        sql = (
            "DELETE FROM Verification "
            "WHERE code = %s AND uid = %d"
        )
        args = (
            code,
            uid,
        )
        query(sql, args)
    except Exception as exc:
        raise exc
