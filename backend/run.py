import traceback
from wsgiref.simple_server import make_server

from src import app
from src.utils import log


if __name__ == "__main__":
    try:
        with make_server('', 5000, app) as httpd:
            log("info", "Server startup", "Starting the API server.")
            httpd.serve_forever()
    except Exception:
        log("critical", "Server startup failed", traceback.format_exc())
