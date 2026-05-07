import httpx
from app.core.config import settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def get_github_user_data(username: str):
    if not username:
        return None
        
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "HackerHouse-API"
    }
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    async with httpx.AsyncClient(headers=headers, timeout=10.0) as client:
        try:
            # Fetch user profile
            profile_response = await client.get(f"{settings.GITHUB_API_URL}/users/{username}")
            
            if profile_response.status_code == 404:
                logger.warning(f"GitHub user {username} not found")
                return None
            elif profile_response.status_code == 403:
                logger.error(f"GitHub API rate limit exceeded or forbidden: {profile_response.text}")
                return None
                
            profile_response.raise_for_status()
            profile_data = profile_response.json()

            # Fetch user repos
            repos_response = await client.get(f"{settings.GITHUB_API_URL}/users/{username}/repos?sort=updated&per_page=100")
            
            if repos_response.status_code == 200:
                repos_data = repos_response.json()
            else:
                logger.warning(f"Could not fetch repos for {username}: {repos_response.status_code}")
                repos_data = []

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
            logger.error(f"GitHub API status error for {username}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching GitHub data for {username}: {e}")
            return None

async def search_github_users(skill: Optional[str] = None, location: Optional[str] = None):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "HackerHouse-API"
    }
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
    
    async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
        try:
            params = {"q": query, "per_page": 30}
            url = f"{settings.GITHUB_API_URL}/search/users"
            response = await client.get(url, params=params)
            
            if response.status_code == 403:
                logger.error(f"GitHub Search API rate limit exceeded: {response.text}")
                return []
                
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
