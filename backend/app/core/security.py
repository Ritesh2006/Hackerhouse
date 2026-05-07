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
    Bcrypt has a 72-byte limit, so we truncate if necessary.
    """
    try:
        if plain_password and len(plain_password) > 72:
            plain_password = plain_password[:72]
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Generate a password hash.
    Bcrypt has a 72-byte limit, so we truncate if necessary to prevent crashes.
    """
    try:
        # Bcrypt has a 72-byte limit. We truncate to ensure stability.
        if password and len(password) > 72:
            logger.warning("Password longer than 72 bytes detected. Truncating for bcrypt compatibility.")
            password = password[:72]
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        # Fallback to something if it fails, though it shouldn't
        raise e
