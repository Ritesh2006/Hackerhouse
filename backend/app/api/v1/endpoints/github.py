from fastapi import APIRouter, HTTPException
from app.services.github_service import get_github_user_data

router = APIRouter()

@router.get("/{username}")
async def fetch_github_data(username: str):
    data = await get_github_user_data(username)
    if not data:
        # Check if it was a rate limit or actual 404
        # For simplicity, we just provide a slightly better message
        raise HTTPException(
            status_code=404, 
            detail=f"GitHub profile for '{username}' could not be retrieved. It might not exist or the API is rate limited."
        )
    return data
