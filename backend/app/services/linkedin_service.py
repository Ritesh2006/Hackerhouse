import httpx
from app.core.config import settings
import logging
from typing import Optional
import time

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

    # Use httpx with timeout
    timeout = httpx.Timeout(5.0, connect=2.0)
    
    async with httpx.AsyncClient(timeout=timeout) as client:
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
                    "linkedin_url": f"https://www.linkedin.com/search/results/all/?keywords={data.get('given_name', '')}+{data.get('family_name', '')}",
                    "experience": [],
                    "skills": [],
                    "is_fallback": False
                }
            else:
                logger.error(f"LinkedIn API error: {response.status_code} - {response.text}")
                # Fallback to basic data instead of None
                return {
                    "headline": "LinkedIn Profile Unavailable",
                    "note": "⚡ LinkedIn data temporarily unavailable",
                    "is_fallback": True
                }
        except Exception as e:
            logger.error(f"Error fetching LinkedIn profile: {e}")
            return {
                "headline": "LinkedIn Connection Error",
                "note": "⚡ Could not connect to LinkedIn",
                "is_fallback": True
            }

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
    
    timeout = httpx.Timeout(10.0, connect=2.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(url, data=data)
            response.raise_for_status()
            return response.json().get("access_token")
        except Exception as e:
            logger.error(f"Error exchanging LinkedIn code: {e}")
            return None
