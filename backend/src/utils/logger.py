"""
Function to handle printing our of error information to api.log.
"""
import logging
import datetime

from ..config import LOGGING


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

FORMATTER = logging.Formatter("%(message)s")

FILE_HANDLER = logging.FileHandler("api.log")
FILE_HANDLER.setFormatter(FORMATTER)

LOGGER.addHandler(FILE_HANDLER)


def log(level, event_name, message):
    """Logs an event to api.log"""
    if LOGGING:
        level = level.lower()
        if level not in ["debug", "info", "warning", "error", "critical"]:
            raise ValueError("Invalid log level.")

        level_code = {
            "debug": 10,
            "info": 20,
            "warning": 30,
            "error": 40,
            "critical": 50
        }

        formatted_message = (
            "{\n"
            "   'level':'%s',\n"
            "   'event_name':'%s',\n"
            "   'time_logged':'%s',\n"
            "   'message':'%s'\n"
            "}"
        ) % (
            level,
            event_name,
            str(datetime.datetime.now()),
            message
        )

        LOGGER.log(
            level=level_code.get(level),
            msg=formatted_message
        )
