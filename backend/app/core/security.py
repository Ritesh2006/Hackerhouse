from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Use a specific configuration for passlib to avoid bcrypt 4.x issues
# We explicitly set the bcrypt handler and truncate long passwords
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__truncate_error=False # Some versions of passlib allow this
)

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
    Verify a password against a hash.
    Bcrypt has a 72-byte limit. We truncate by byte length to match hashing logic.
    """
    try:
        if plain_password:
            password_bytes = plain_password.encode('utf-8')
            if len(password_bytes) > 72:
                plain_password = password_bytes[:72].decode('utf-8', errors='ignore')
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Generate a password hash.
    Bcrypt has a 72-byte limit. We truncate by byte length to ensure stability
    with multi-byte UTF-8 characters.
    """
    try:
        if not password:
            return ""
            
        # Truncate by byte length (72 bytes is the limit for bcrypt)
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            logger.warning("Password longer than 72 bytes detected. Truncating for bcrypt compatibility.")
            password = password_bytes[:72].decode('utf-8', errors='ignore')
            
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise e
