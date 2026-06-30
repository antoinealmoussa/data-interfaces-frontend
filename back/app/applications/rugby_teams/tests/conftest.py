import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[4]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from app.tests.conftest import *  # noqa: F401,F403
