from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
from fastapi import Depends, status, HTTPException, Request
from jose import JWTError, jwt
from app.services.user_service import get_user_by_email
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.logging_config import logger


async def get_token_from_request(request: Request) -> Optional[str]:
    return request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)

def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt
    

async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current user from JWT token in cookie or Authorization header"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
        
        token_version = payload.get("token_version")
        if token_version is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    
    if user.token_version != token_version:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get the current user"""
    return current_user