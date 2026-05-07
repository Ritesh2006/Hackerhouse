from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.database import get_database
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserResponse
from app.services.matching_service import find_matching_developers
from typing import List, Optional

router = APIRouter()

@router.get("/")
async def get_users(
    skill: Optional[str] = None,
    name: Optional[str] = None,
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
):
    skills = [skill] if skill else None
    users, is_fallback = await find_matching_developers(
        skills=skills,
        name=name,
        lat=lat,
        lon=lon,
        location_name=location
    )
    
    return {
        "success": True,
        "count": len(users),
        "data": users,
        "is_fallback": is_fallback
    }

@router.get("/{id}", response_model=UserResponse)
async def get_user(id: str, db=Depends(get_database)):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(id)
    
    # Handle GitHub virtual users
    if not user and id.startswith("gh_"):
        from app.services.github_service import get_github_user_data
        from datetime import datetime
        
        username = id.replace("gh_", "")
        gh_data = await get_github_user_data(username)
        
        if gh_data:
            return {
                "_id": id,
                "full_name": gh_data.get("name") or gh_data.get("username"),
                "email": gh_data.get("email"),
                "role": "developer",
                "skills": gh_data.get("languages", []),
                "bio": gh_data.get("bio"),
                "avatar_url": gh_data.get("avatar_url"),
                "github_username": gh_data.get("username"),
                "location_name": gh_data.get("location"),
                "is_active": True,
                "created_at": datetime.utcnow()
            }

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
