import traceback

from waitress import serve

from src import app
from src.utils import log


if __name__ == "__main__":
    try:
        log("info", "Server startup", "Starting the API server.")
        serve(app, host="0.0.0.0", port="5000")
    except Exception:
        log("critical", "Server startup failed", traceback.format_exc())
