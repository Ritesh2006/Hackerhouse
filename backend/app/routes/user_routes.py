from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from ..schemas.user_schema import UserResponse, UserUpdate
from ..core.database import get_database
from ..services.matching_service import find_matching_developers
from bson import ObjectId
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from ..core.config import settings
from ..core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing user identity")
        
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = str(user.pop("_id"))
    return user

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skill: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    max_dist: float = Query(100.0)
):
    skills = [skill] if skill else None
    users = await find_matching_developers(
        skills=skills, 
        name=name,
        lat=lat, 
        lon=lon, 
        location_name=location,
        max_distance_km=max_dist
    )
    
    # Matching service already converts _id to id string and calculates distance
    return users

from ..services.github_service import get_github_user_data

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str):
    if user_id.startswith("gh_"):
        github_username = user_id[3:]
        try:
            gh_user = await get_github_user_data(github_username)
            if not gh_user:
                # If API fails, return a stub so the page doesn't show "Not Found"
                return {
                    "id": user_id,
                    "name": github_username,
                    "github_username": github_username,
                    "bio": "GitHub profile details currently unavailable.",
                    "avatar_url": f"https://github.com/{github_username}.png",
                    "skills": [],
                    "role": "developer",
                    "location_name": "Global",
                    "distance_km": None
                }
            return {
                "id": user_id,
                "name": gh_user["name"] or gh_user["username"],
                "github_username": gh_user["username"],
                "email": gh_user.get("email"),
                "bio": gh_user["bio"],
                "avatar_url": gh_user["avatar_url"],
                "skills": gh_user["languages"],
                "role": "developer",
                "location_name": gh_user.get("location") or "Remote",
                "distance_km": None
            }
        except Exception as e:
            logger.error(f"GitHub fetch error: {e}")
            raise HTTPException(status_code=500, detail="Error fetching GitHub data")

    db = get_database()
    # Validate ObjectID format to prevent internal server errors
    import re
    if not re.match(r"^[0-9a-fA-F]{24}$", user_id):
         raise HTTPException(status_code=404, detail="User not found (Invalid ID format)")
         
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user["id"] = str(user.pop("_id"))
        return user
    except Exception as e:
        logger.error(f"DB Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Database access error")

@router.get("/me/profile", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, update_data: UserUpdate):
    db = get_database()
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_dict.get("location"):
        # Ensure it's in GeoJSON format
        update_dict["location"] = update_dict["location"].dict()

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    return updated_user
