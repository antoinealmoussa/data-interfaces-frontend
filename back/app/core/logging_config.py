import logging
import sys

from app.core.config import settings


def setup_logging():
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.DEBUG)

    logger = logging.getLogger("app")
    logger.setLevel(level)

    logger.handlers = []

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    formatter = logging.Formatter(
        fmt="[%(asctime)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger

logger = setup_logging()
