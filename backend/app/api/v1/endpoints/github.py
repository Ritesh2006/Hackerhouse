from app.services.github_service import get_github_user_data, get_github_access_token, get_github_username_from_token

router = APIRouter()

@router.get("/callback")
async def github_callback(code: str):
    token = await get_github_access_token(code)
    if not token:
        raise HTTPException(status_code=400, detail="Failed to get access token")
    
    username = await get_github_username_from_token(token)
    if not username:
        raise HTTPException(status_code=400, detail="Failed to fetch GitHub profile")
    return {"username": username}

@router.get("/{username}")
async def fetch_github_data(username: str):
    """
    Fetch GitHub data for a specific user.
    Always returns a response even if GitHub API fails (using fallback data).
    """
    data = await get_github_user_data(username)
    return data
