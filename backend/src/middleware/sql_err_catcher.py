"""
Middleware to catch errors raised while making DB queries.
"""
import traceback
from functools import wraps

import mysql.connector

from ..utils import log
from ..models.users import NoResults


def sql_err_catcher():
    """
    Function wrapper for catching SQL errors.
    :return:
    None - If all goes well...
    """
    def _sql_err_catcher(func):
        @wraps(func)
        def __sql_err_catcher(*args, **kwargs):
            try:
                res = func(*args, *kwargs)
                return res
            except mysql.connector.errors.IntegrityError:
                log(
                    "warning",
                    "Attempted to create a duplicate entry.",
                    traceback.format_exc()
                )
                return {"message": "Duplicate entry"}, 409
            except NoResults:
                log(
                    "error", "Select query returned no results",
                    traceback.format_exc()
                )
                return {"message": "A result could not be found."}, 401
            # Intended to be a general catch all exception.
            except Exception:  # pylint:disable=W0703
                log("error", "MySQL query failed", traceback.format_exc())
                return {"message": "MySQL unavailable."}, 503
        return __sql_err_catcher
    return _sql_err_catcher
