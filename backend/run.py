"""
This is the kick-off function for the backend flask REST API server.
"""
import traceback
from wsgiref.simple_server import make_server

from src import APP  # pylint:disable=E0401
from src.utils import log  # pylint:disable=E0401


if __name__ == "__main__":
    try:
        with make_server('', 5000, APP) as httpd:
            log("info", "Server startup", "Starting the API server.")
            httpd.serve_forever()
    # pylint: disable=W0703
    except Exception:
        log("critical", "Server startup failed", traceback.format_exc())
