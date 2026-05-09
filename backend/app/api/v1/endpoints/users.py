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
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🔍 Fetching profile for ID: {id}")
    
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(id)
    
    if user:
        # Standardize for frontend consistency
        if "name" not in user and "full_name" in user:
            user["name"] = user["full_name"]
            
        # Add social URL fallbacks
        if user.get("linkedin_id") and not user.get("linkedin_url"):
            user["linkedin_url"] = f"https://www.linkedin.com/search/results/all/?keywords={user.get('name', 'Developer').replace(' ', '+')}"
        if user.get("github_username") and not user.get("github_url"):
            user["github_url"] = f"https://github.com/{user['github_username']}"
            
        return user

    # Handle Virtual Users (GitHub/LinkedIn) if not in database
    from datetime import datetime, UTC
    
    if id.startswith("gh_") or id.startswith("li_"):
        logger.info(f"🏗️ Generating virtual profile for {id}")
        
        if id.startswith("gh_"):
            from app.services.github_service import get_github_user_data
            username = id.replace("gh_", "")
            gh_data = await get_github_user_data(username)
            
            name = (gh_data.get("name") if gh_data else None) or username
            return {
                "_id": id,
                "name": name,
                "full_name": name,
                "email": gh_data.get("email") if gh_data else None,
                "role": "developer",
                "skills": gh_data.get("languages", []) if gh_data else [],
                "bio": (gh_data.get("bio") if gh_data else None) or f"External GitHub Developer ({username})",
                "avatar_url": gh_data.get("avatar_url") if gh_data else None,
                "github_username": username,
                "github_url": f"https://github.com/{username}",
                "location_name": gh_data.get("location") if gh_data else "Global",
                "is_active": True,
                "created_at": datetime.now(UTC)
            }
        
        if id.startswith("li_"):
            from app.services.linkedin_service import get_linkedin_profile
            li_profile = await get_linkedin_profile()
            name = "LinkedIn Developer"
            if li_profile and not li_profile.get("is_fallback"):
                name = f"{li_profile.get('first_name', '')} {li_profile.get('last_name', '')}".strip()
            
            return {
                "_id": id,
                "name": name,
                "full_name": name,
                "role": "developer",
                "skills": li_profile.get("skills", []) if li_profile else [],
                "bio": li_profile.get("headline", "Verified LinkedIn Professional Profile") if li_profile else "Verified LinkedIn Professional Profile",
                "avatar_url": li_profile.get("profile_picture") if li_profile else None,
                "linkedin_url": li_profile.get("linkedin_url") if li_profile and not li_profile.get("is_fallback") else f"https://www.linkedin.com/search/results/all/?keywords={name.replace(' ', '+')}",
                "is_active": True,
                "created_at": datetime.now(UTC)
            }

    logger.warning(f"❌ User not found in DB or Virtual Registry: {id}")
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
