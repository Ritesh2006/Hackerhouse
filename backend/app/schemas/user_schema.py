from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class GeoLocation(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [long, lat]

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    name: str
    role: str
    skills: List[str] = []
    bio: Optional[str] = None
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin_id: Optional[str] = None
    location_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    skills: Optional[List[str]] = None
    github_username: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin_id: Optional[str] = None
    location: Optional[GeoLocation] = None
    location_name: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    location: Optional[GeoLocation] = None

    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str
    location: Optional[GeoLocation] = None
    distance_km: Optional[float] = None
