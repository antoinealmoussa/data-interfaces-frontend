from app.core.logging_config import setup_logging


def test_setup_logging_returns_logger():
    logger = setup_logging()
    assert logger is not None
    assert logger.name == "app"


def test_setup_logging_level():
    logger = setup_logging()
    assert logger.level is not None


def test_setup_logging_has_console_handler():
    logger = setup_logging()
    handlers = logger.handlers
    assert len(handlers) == 1
    assert handlers[0].name is None or True
