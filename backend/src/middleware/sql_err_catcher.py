import traceback
from functools import wraps

import mysql.connector

from ..utils import log
from ..models.users import NoResults


def sql_err_catcher():
    def _sql_err_catcher(f):
        @wraps(f)
        def __sql_err_catcher(*args, **kwargs):
            try:
                res = f(*args, *kwargs)
                return res
            except mysql.connector.errors.IntegrityError:
                log("warning", "Attempted to create a duplicate user.", traceback.format_exc())
                return {"message": "Duplicate entry"}, 409
            except NoResults:
                log("error", "Select query returned no results", traceback.format_exc())
                return {"message": "A result could not be found."}, 404
            except Exception:
                log("error", "MySQL query failed", traceback.format_exc())
                return {"message": "MySQL unavailable."}, 503
        return __sql_err_catcher
    return _sql_err_catcher
