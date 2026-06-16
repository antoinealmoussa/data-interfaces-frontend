import time
from collections import defaultdict

from fastapi import HTTPException, Request


class RateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.attempts: dict[str, list[float]] = defaultdict(list)

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.window_seconds

        self.attempts[client_ip] = [
            t for t in self.attempts[client_ip] if t > window_start
        ]

        if len(self.attempts[client_ip]) >= self.max_requests:
            raise HTTPException(
                status_code=429,
                detail="Trop de tentatives. Veuillez réessayer dans 60 secondes."
            )

        self.attempts[client_ip].append(now)
