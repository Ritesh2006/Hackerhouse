from app.db.database import get_database
from app.utils.geo_utils import haversine_distance
from app.services.github_service import search_github_users
from typing import List, Optional, Tuple
import uuid
import logging
import re

logger = logging.getLogger(__name__)

async def find_matching_developers(
    skills: Optional[List[str]] = None,
    name: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    location_name: Optional[str] = None,
    max_distance_km: float = 100.0
) -> Tuple[List[dict], bool]:
    db = await get_database()
    is_fallback = False
    
    logger.info(f"Incoming search params: skills={skills}, location={location_name}, lat={lat}, lon={lon}")

    # 1. Search Local Database
    async def search_local(apply_location=True):
        query = {"role": "developer"}
        
        if skills:
            skill_queries = []
            for s in skills:
                clean_s = s.lower().strip()
                skill_queries.append(re.compile(f".*{clean_s}.*", re.IGNORECASE))
            query["skills"] = {"$in": skill_queries}
        
        if name:
            query["name"] = {"$regex": name, "$options": "i"}

        if apply_location:
            if lat is not None and lon is not None:
                query["location"] = {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]
                        },
                        "$maxDistance": max_distance_km * 1000
                    }
                }
            elif location_name:
                query["location_name"] = {"$regex": location_name, "$options": "i"}

        cursor = db.users.find(query)
        if not apply_location:
            cursor = cursor.sort("rating", -1)
            
        return await cursor.to_list(length=30)

    # Execute searches
    local_users = await search_local(apply_location=True)
    
    # 2. INTEGRATE REAL GITHUB DATA (Now always active, not just fallback)
    github_users = []
    if skills or location_name:
        try:
            search_skill = skills[0] if skills else None
            gh_results = await search_github_users(skill=search_skill, location=location_name)
            for gh_user in gh_results:
                github_users.append({
                    "id": f"gh_{gh_user['username']}",
                    "name": gh_user.get("name") or gh_user["username"],
                    "github_username": gh_user["username"],
                    "avatar_url": gh_user.get("avatar_url"),
                    "skills": gh_user.get("languages", []),
                    "bio": gh_user.get("bio"),
                    "location_name": gh_user.get("location") or "GitHub",
                    "rating": 4.9, # Real GitHub talent
                    "hourly_rate": 95,
                    "public_repos": gh_user.get("public_repos", 0),
                    "total_stars": gh_user.get("total_stars", 0),
                    "role": "developer",
                    "is_virtual": True,
                    "source": "github"
                })
        except Exception as e:
            logger.error(f"GitHub search failed: {e}")

    # Step 3: Local Fallback (Global) if no local users found in location
    if not local_users and not github_users:
        logger.info("No location matches found. Expanding to global search.")
        is_fallback = True
        local_users = await search_local(apply_location=False)

    # 4. Merge and Deduplicate
    all_users = []
    seen_usernames = set()
    
    # Prioritize local users
    for u in local_users:
        u["id"] = str(u.pop("_id")) if "_id" in u else u.get("id")
        gh_username = u.get("github_username")
        if gh_username:
            seen_usernames.add(gh_username.lower())
        all_users.append(u)
        
    # Add unique GitHub users
    for gu in github_users:
        if gu["github_username"].lower() not in seen_usernames:
            all_users.append(gu)
            seen_usernames.add(gu["github_username"].lower())

    # Final Processing
    processed_users = []
    for user in all_users:
        if lat is not None and lon is not None and user.get("location"):
            u_lon, u_lat = user["location"]["coordinates"]
            user["distance_km"] = haversine_distance(lat, lon, u_lat, u_lon)
        else:
            user["distance_km"] = None
        processed_users.append(user)

    # Only show fallback warning if we really didn't find anyone in the location
    is_fallback = (len(processed_users) > 0 and len(local_users) > 0 and not any("distance_km" in u and u["distance_km"] is not None for u in local_users)) if location_name or lat else False
    
    # Simplified is_fallback: True only if we had to find users outside the specified location
    if (location_name or lat) and not any(u.get("location_name") and (location_name.lower() in u["location_name"].lower()) for u in processed_users):
        is_fallback = True
    else:
        is_fallback = False

    logger.info(f"Merged search results: {len(processed_users)}, is_fallback: {is_fallback}")
    return processed_users[:40], is_fallback

