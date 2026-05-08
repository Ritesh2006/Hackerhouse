from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.database import get_database
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserResponse
from app.services.matching_service import find_matching_developers
from typing import List, Optional
from app.deps.auth_dep import get_current_user

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
    
    if user:
        return user

    # Handle Virtual Users (GitHub/LinkedIn) if not in database
    from datetime import datetime
    
    if id.startswith("gh_"):
        from app.services.github_service import get_github_user_data
        username = id.replace("gh_", "")
        gh_data = await get_github_user_data(username)
        
        # Always return a profile for a gh_ ID
        return {
            "_id": id,
            "full_name": (gh_data.get("name") if gh_data else None) or username,
            "email": gh_data.get("email") if gh_data else None,
            "role": "developer",
            "skills": gh_data.get("languages", []) if gh_data else [],
            "bio": (gh_data.get("bio") if gh_data else None) or f"GitHub developer ({username})",
            "avatar_url": gh_data.get("avatar_url") if gh_data else None,
            "github_username": username,
            "location_name": gh_data.get("location") if gh_data else "Global",
            "is_active": True,
            "created_at": datetime.utcnow()
        }

    if id.startswith("li_"):
        return {
            "_id": id,
            "full_name": "LinkedIn Developer",
            "role": "developer",
            "skills": [],
            "bio": "Verified LinkedIn Professional",
            "is_active": True,
            "created_at": datetime.utcnow()
        }

    raise HTTPException(status_code=404, detail="User not found")

@router.post("/link-github")
async def link_github(username: str, current_user = Depends(get_current_user), db = Depends(get_database)):
    user_repo = UserRepository(db)
    await user_repo.update(current_user["_id"], {"github_username": username})
    return {"status": "success", "github_username": username}

@router.post("/link-linkedin")
async def link_linkedin(linkedin_id: str, current_user = Depends(get_current_user), db = Depends(get_database)):
    user_repo = UserRepository(db)
    await user_repo.update(current_user["_id"], {"linkedin_id": linkedin_id})
    return {"status": "success", "linkedin_id": linkedin_id}
