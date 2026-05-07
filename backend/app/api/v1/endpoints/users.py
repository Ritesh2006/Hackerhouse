from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.database import get_database
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserResponse
from app.services.matching_service import find_matching_developers
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skill: Optional[str] = None,
    name: Optional[str] = None,
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
):
    skills = [skill] if skill else None
    return await find_matching_developers(
        skills=skills,
        name=name,
        lat=lat,
        lon=lon,
        location_name=location
    )

@router.get("/{id}", response_model=UserResponse)
async def get_user(id: str, db=Depends(get_database)):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
