from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: str
    role: str = "client"
    skills: List[str] = []
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github_username: Optional[str] = None
    location_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    bio: Optional[str] = None
    location: Optional[List[float]] = None

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    is_active: bool
    created_at: datetime
    distance_km: Optional[float] = None

    class Config:
        populate_by_name = True
