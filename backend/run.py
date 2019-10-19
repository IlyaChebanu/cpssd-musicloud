import traceback

from src import app
from src.logger.logger import log


if __name__ == "__main__":
    try:
        log("info", "Server startup", "Starting the API server.")
        app.run()
    except Exception:
        log("critical", "Server startup failed", traceback.format_exc())
