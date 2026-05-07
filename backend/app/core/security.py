from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
import bcrypt
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash using the bcrypt library directly.
    This avoids passlib compatibility issues with newer bcrypt/python versions.
    """
    try:
        if not plain_password or not hashed_password:
            return False
            
        # Ensure we are working with bytes
        password_bytes = plain_password.encode('utf-8')
        
        # Bcrypt has a 72-byte limit. Truncate if necessary.
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
            
        # Hashed password from DB must be bytes for bcrypt.checkpw
        if isinstance(hashed_password, str):
            hashed_bytes = hashed_password.encode('utf-8')
        else:
            hashed_bytes = hashed_password
            
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Generate a password hash using the bcrypt library directly.
    This avoids passlib compatibility issues with newer bcrypt/python versions.
    """
    try:
        if not password:
            return ""
            
        # Ensure we are working with bytes
        password_bytes = password.encode('utf-8')
        
        # Bcrypt has a 72-byte limit. Truncate if necessary.
        if len(password_bytes) > 72:
            logger.warning("Password longer than 72 bytes detected. Truncating for bcrypt compatibility.")
            password_bytes = password_bytes[:72]
            
        # Generate salt and hash
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # Return as string for database storage
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise e
