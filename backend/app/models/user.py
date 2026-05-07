from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

class GeoLocation(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str = "client"  # client, developer, admin
    skills: List[str] = []
    location: Optional[GeoLocation] = None
    bio: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
