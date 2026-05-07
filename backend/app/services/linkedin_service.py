import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def get_linkedin_profile(access_token: str = None):
    """
    Fetches LinkedIn profile data using the provided or configured access token.
    Uses the UserInfo endpoint (OIDC compliant).
    """
    token = access_token or settings.LINKEDIN_ACCESS_TOKEN
    if not token:
        logger.warning("No LinkedIn access token available.")
        return None

    async with httpx.AsyncClient() as client:
        try:
            # LinkedIn UserInfo endpoint for OIDC
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.get("https://api.linkedin.com/v2/userinfo", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "linkedin_id": data.get("sub"),
                    "first_name": data.get("given_name"),
                    "last_name": data.get("family_name"),
                    "profile_picture": data.get("picture"),
                    "email": data.get("email"),
                    "headline": "LinkedIn Verified Developer",
                    "experience": [],
                    "skills": []
                }
            else:
                logger.error(f"LinkedIn API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error fetching LinkedIn profile: {e}")
            return None

async def get_linkedin_access_token(code: str, redirect_uri: str):
    """
    Exchange authorization code for access token.
    """
    url = "https://www.linkedin.com/oauth/v2/accessToken"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "client_secret": settings.LINKEDIN_CLIENT_SECRET,
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, data=data)
            response.raise_for_status()
            return response.json().get("access_token")
        except Exception as e:
            logger.error(f"Error exchanging LinkedIn code: {e}")
            return None
