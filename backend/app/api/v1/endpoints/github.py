from fastapi import APIRouter, HTTPException
from app.services.github_service import get_github_user_data

router = APIRouter()

@router.get("/{username}")
async def fetch_github_data(username: str):
    data = await get_github_user_data(username)
    if not data:
        raise HTTPException(status_code=404, detail="GitHub user not found or API error")
    return data
