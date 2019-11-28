"""
This is the kick-off function for the backend flask REST API server.
"""
import traceback
from wsgiref.simple_server import make_server

from backend.src import app
from backend.src.utils import log


if __name__ == "__main__":
    try:
        with make_server('', 5000, app) as httpd:
            log("info", "Server startup", "Starting the API server.")
            httpd.serve_forever()
    # pylint: disable=W0703
    except Exception:
        log("critical", "Server startup failed", traceback.format_exc())
