import httpx
from app.core.config import settings
import logging
from typing import Optional, List
from app.db.database import db
from app.repositories.user_repo import UserRepository
import asyncio
import time

logger = logging.getLogger(__name__)

async def get_github_fallback(username: str, note: str = "GitHub data temporarily unavailable"):
    """Fetch developer data from MongoDB as a fallback when GitHub API fails."""
    try:
        if db.db is not None:
            repo = UserRepository(db.db)
            user = await repo.get_by_username(username)
            if user:
                return {
                    "username": username,
                    "name": user.get("name") or username,
                    "bio": user.get("bio") or "Professional developer",
                    "avatar_url": user.get("avatar_url") or f"https://ui-avatars.com/api/?name={username}",
                    "location": user.get("location_name") or "Unknown",
                    "public_repos": 0,
                    "followers": 0,
                    "total_stars": 0,
                    "languages": user.get("skills") or [],
                    "email": user.get("email"),
                    "top_repos": [],
                    "note": f"⚡ Limited profile data available: {note}",
                    "is_fallback": True
                }
    except Exception as e:
        logger.error(f"Fallback DB search failed for {username}: {e}")
        
    return {
        "username": username,
        "name": username,
        "bio": "Developer profile",
        "avatar_url": f"https://ui-avatars.com/api/?name={username}",
        "public_repos": 0,
        "followers": 0,
        "total_stars": 0,
        "languages": [],
        "top_repos": [],
        "note": f"⚡ Limited profile data available: {note}",
        "is_fallback": True
    }

async def get_github_user_data(username: str):
    if not username:
        return None
        
    start_time = time.time()
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "HackerHouse-API"
    }
    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    # Use httpx with timeout (5 seconds as requested)
    timeout = httpx.Timeout(5.0, connect=2.0)
    
    for attempt in range(3):  # 1 initial + 2 retries
        try:
            async with httpx.AsyncClient(headers=headers, timeout=timeout) as client:
                # Fetch user profile
                profile_response = await client.get(f"{settings.GITHUB_API_URL}/users/{username}")
                
                if profile_response.status_code == 404:
                    logger.warning(f"GitHub user {username} not found")
                    return await get_github_fallback(username, "User not found on GitHub")
                elif profile_response.status_code == 403:
                    logger.error(f"GitHub API rate limit exceeded: {profile_response.text}")
                    return await get_github_fallback(username, "GitHub rate limit hit")
                    
                profile_response.raise_for_status()
                profile_data = profile_response.json()

                # Fetch user repos
                repos_response = await client.get(f"{settings.GITHUB_API_URL}/users/{username}/repos?sort=updated&per_page=100")
                
                repos_data = []
                if repos_response.status_code == 200:
                    repos_data = repos_response.json()
                else:
                    logger.warning(f"Could not fetch repos for {username}: {repos_response.status_code}")

                # Process repos
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

                logger.info(f"Successfully fetched GitHub data for {username} in {time.time() - start_time:.2f}s")
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
                    "top_repos": sorted(repo_list, key=lambda x: x["stars"], reverse=True)[:10],
                    "is_fallback": False
                }
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            logger.error(f"GitHub API error (attempt {attempt+1}) for {username}: {e}")
            if attempt < 2:
                await asyncio.sleep(0.5 * (attempt + 1))  # Exponential-ish backoff
                continue
            return await get_github_fallback(username, str(e))
        except Exception as e:
            logger.error(f"Unexpected error fetching GitHub data for {username}: {e}")
            return await get_github_fallback(username, "Internal error")

async def search_github_users(skill: Optional[str] = None, location: Optional[str] = None):
    start_time = time.time()
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
    timeout = httpx.Timeout(10.0, connect=2.0)
    
    try:
        async with httpx.AsyncClient(headers=headers, timeout=timeout) as client:
            params = {"q": query, "per_page": 30}
            url = f"{settings.GITHUB_API_URL}/search/users"
            response = await client.get(url, params=params)
            
            if response.status_code == 403:
                logger.error(f"GitHub Search API rate limit exceeded: {response.text}")
                return []
                
            response.raise_for_status()
            data = response.json()
            
            items = data.get("items", [])[:15]
            
            # Fetch all profiles concurrently
            tasks = [get_github_user_data(item["login"]) for item in items]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            users = []
            for res in results:
                if res and not isinstance(res, Exception):
                    users.append(res)
            
            logger.info(f"GitHub search completed in {time.time() - start_time:.2f}s")
            return users
    except Exception as e:
        logger.error(f"Error searching GitHub users: {e}")
        return []
