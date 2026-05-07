import httpx
from ..core.config import settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def get_github_user_data(username: str):
    headers = {}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    async with httpx.AsyncClient(headers=headers) as client:
        try:
            # Fetch user profile
            profile_response = await client.get(f"{settings.GITHUB_API_URL}/users/{username}")
            profile_response.raise_for_status()
            profile_data = profile_response.json()

            # Fetch user repos
            repos_response = await client.get(f"{settings.GITHUB_API_URL}/users/{username}/repos?sort=updated&per_page=100")
            repos_response.raise_for_status()
            repos_data = repos_response.json()

            # Process repos to get languages and stars
            languages = set()
            total_stars = 0
            repo_list = []

            for repo in repos_data:
                if repo.get("language"):
                    languages.add(repo["language"])
                total_stars += repo.get("stargazers_count", 0)
                repo_list.append({
                    "name": repo["name"],
                    "stars": repo.get("stargazers_count", 0),
                    "language": repo.get("language"),
                    "url": repo.get("html_url")
                })

            return {
                "username": username,
                "name": profile_data.get("name"),
                "bio": profile_data.get("bio"),
                "avatar_url": profile_data.get("avatar_url"),
                "location": profile_data.get("location"),
                "public_repos": profile_data.get("public_repos"),
                "followers": profile_data.get("followers"),
                "total_stars": total_stars,
                "languages": list(languages),
                "email": profile_data.get("email"),
                "top_repos": sorted(repo_list, key=lambda x: x["stars"], reverse=True)[:10]
            }
        except httpx.HTTPStatusError as e:
            logger.error(f"GitHub API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching GitHub data: {e}")
            return None

async def search_github_users(skill: Optional[str] = None, location: Optional[str] = None):
    headers = {}
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    # Build query
    query_parts = []
    if skill:
        query_parts.append(skill)
    if location:
        query_parts.append(f"location:{location}")
    
    if not query_parts:
        query_parts.append("type:user")
        
    query = "+".join(query_parts)
    
    async with httpx.AsyncClient(headers=headers) as client:
        try:
            url = f"{settings.GITHUB_API_URL}/search/users?q={query}&per_page=30"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            items = data.get("items", [])[:15] # Limit to 15 to ensure lightning fast speed
            
            # Fetch all profiles concurrently
            import asyncio
            tasks = [get_github_user_data(item["login"]) for item in items]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            users = []
            for res in results:
                if res and not isinstance(res, Exception):
                    users.append(res)
            return users
        except Exception as e:
            logger.error(f"Error searching GitHub users: {e}")
            return []
from typing import Optional
