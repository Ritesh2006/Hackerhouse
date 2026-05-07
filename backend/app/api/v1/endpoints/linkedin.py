from fastapi import APIRouter, HTTPException, Query
from app.services.linkedin_service import get_linkedin_profile, get_linkedin_access_token

router = APIRouter()

@router.get("/callback")
async def linkedin_callback(code: str, redirect_uri: str):
    token = await get_linkedin_access_token(code, redirect_uri)
    if not token:
        raise HTTPException(status_code=400, detail="Failed to get access token")
    
    profile = await get_linkedin_profile(token)
    if not profile:
        raise HTTPException(status_code=400, detail="Failed to fetch LinkedIn profile")
    return {"profile": profile}

@router.get("/profile")
async def get_profile(token: str = Query(...)):
    profile = await get_linkedin_profile(token)
    if not profile:
        raise HTTPException(status_code=400, detail="Could not fetch LinkedIn profile")
    return profile

@router.get("/me")
async def get_my_linkedin_profile():
    profile = await get_linkedin_profile()
    if not profile:
        raise HTTPException(status_code=400, detail="Could not fetch LinkedIn profile from stored token")
    return profile
