import logging
import datetime

from ..config import LOGGING


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

formatter = logging.Formatter("%(message)s")

file_handler = logging.FileHandler("api.log")
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)


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

        logger.log(
            level=level_code.get(level),
            msg=formatted_message
        )
