import traceback

from waitress import serve

from src import app
from src.logger.logger import log
from src.config import HOST


if __name__ == "__main__":
    try:
        log("info", "Server startup", "Starting the API server.")
        host = HOST.split(":")[0]
        port = HOST.split(":")[1]
        serve(app, host=host, port=port)
    except Exception:
        log("critical", "Server startup failed", traceback.format_exc())
