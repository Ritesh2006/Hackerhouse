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
    return {
        "profile": profile,
        "access_token": token
    }

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

@router.get("/status")
async def linkedin_status():
    """Diagnostic endpoint to check if LinkedIn API is reachable."""
    from app.core.config import settings
    has_token = bool(settings.LINKEDIN_ACCESS_TOKEN)
    has_client = bool(settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET)
    
    return {
        "configured": has_token and has_client,
        "token_available": has_token,
        "client_ready": has_client,
        "mode": "production" if has_token else "development/fallback"
    }
