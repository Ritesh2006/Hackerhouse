from fastapi import APIRouter
from app.services.github_service import get_github_user_data

router = APIRouter()

@router.get("/{username}")
async def fetch_github_data(username: str):
    """
    Fetch GitHub data for a specific user.
    Always returns a response even if GitHub API fails (using fallback data).
    """
    data = await get_github_user_data(username)
    return data
