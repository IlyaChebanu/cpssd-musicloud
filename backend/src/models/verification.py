from backend.src.utils import query


def insert_verification(code, uid):
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
