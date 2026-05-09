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
            skill_queries = [re.compile(f".*{s.lower().strip()}.*", re.IGNORECASE) for s in skills]
            query["skills"] = {"$in": skill_queries}
        
        if name:
            query["name"] = {"$regex": name, "$options": "i"}

        if apply_location:
            if lat is not None and lon is not None:
                query["location"] = {
                    "$near": {
                        "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                        "$maxDistance": max_distance_km * 1000
                    }
                }
            elif location_name:
                query["location_name"] = {"$regex": location_name, "$options": "i"}

        logger.info(f"Local query: {query}, apply_location: {apply_location}")
        cursor = db.users.find(query)
        if not apply_location:
            cursor = cursor.sort("rating", -1)
            
        return await cursor.to_list(length=30)

    # Execute searches
    local_users = await search_local(apply_location=True)
    logger.info(f"Local results (primary): {len(local_users)}")
    
    # 2. INTEGRATE REAL GITHUB DATA
    github_users = []
    if skills or location_name or name:
        try:
            search_skill = skills[0] if skills else None
            logger.info(f"Querying GitHub: skill={search_skill}, location={location_name}, name={name}")
            gh_results = await search_github_users(skill=search_skill, location=location_name, name=name)
            for gh_user in gh_results:
                github_users.append({
                    "id": f"gh_{gh_user['username']}",
                    "name": gh_user.get("name") or gh_user["username"],
                    "github_username": gh_user["username"],
                    "avatar_url": gh_user.get("avatar_url"),
                    "skills": gh_user.get("languages", []),
                    "bio": gh_user.get("bio"),
                    "location_name": gh_user.get("location") or "GitHub",
                    "rating": 4.9,
                    "hourly_rate": 95,
                    "public_repos": gh_user.get("public_repos", 0),
                    "total_stars": gh_user.get("total_stars", 0),
                    "role": "developer",
                    "is_virtual": True,
                    "source": "github"
                })
            logger.info(f"GitHub results: {len(github_users)}")
        except Exception as e:
            logger.error(f"GitHub search failed: {e}")

    # 3. INTEGRATE LINKEDIN DATA (Verified Account)
    linkedin_users = []
    try:
        from app.services.linkedin_service import get_linkedin_profile
        li_profile = await get_linkedin_profile()
        if li_profile and not li_profile.get("is_fallback"):
            li_name = f"{li_profile.get('first_name', '')} {li_profile.get('last_name', '')}".strip()
            if not name or name.lower() in li_name.lower():
                linkedin_users.append({
                    "id": f"li_{li_profile['linkedin_id']}",
                    "name": li_name,
                    "linkedin_id": li_profile['linkedin_id'],
                    "avatar_url": li_profile.get("profile_picture"),
                    "bio": li_profile.get("headline"),
                    "skills": li_profile.get("skills", []),
                    "location_name": "LinkedIn Verified",
                    "rating": 5.0,
                    "hourly_rate": 120,
                    "role": "developer",
                    "is_virtual": True,
                    "source": "linkedin"
                })
    except Exception as e:
        logger.error(f"LinkedIn integration error: {e}")

    # Step 4: Local Fallback (Global) if no results found
    if not local_users and not github_users and not linkedin_users:
        logger.info("No matches found in location. Expanding to global local search.")
        is_fallback = True
        local_users = await search_local(apply_location=False)

    # 5. Merge and Deduplicate
    all_users = []
    seen_ids = set()
    
    for lu in linkedin_users:
        all_users.append(lu)
        seen_ids.add(lu["id"])

    for u in local_users:
        u_id = str(u.pop("_id")) if "_id" in u else u.get("id")
        u["id"] = u_id
        if u_id not in seen_ids:
            all_users.append(u)
            seen_ids.add(u_id)
        
    for gu in github_users:
        if gu["id"] not in seen_ids:
            all_users.append(gu)
            seen_ids.add(gu["id"])

    # Final Processing
    processed_users = []
    for user in all_users:
        # Ensure 'skills' is ALWAYS a list to prevent frontend .map() crashes
        if "skills" not in user or user["skills"] is None:
            user["skills"] = []
        
        # Ensure 'bio' is not None
        if "bio" not in user or user["bio"] is None:
            user["bio"] = "Professional Developer and HackerHouse member."
            
        # Add LinkedIn URL if ID exists but URL doesn't
        if user.get("linkedin_id") and not user.get("linkedin_url"):
            # We can't generate a perfect direct URL from just an ID without the vanity name,
            # but we can provide a better search link or placeholder.
            user["linkedin_url"] = f"https://www.linkedin.com/search/results/all/?keywords={user.get('name', 'Developer')}"

        if lat is not None and lon is not None and user.get("location"):
            try:
                u_lon, u_lat = user["location"]["coordinates"]
                user["distance_km"] = haversine_distance(lat, lon, u_lat, u_lon)
            except (KeyError, TypeError, ValueError):
                user["distance_km"] = None
        else:
            user["distance_km"] = None
        processed_users.append(user)

    # Correct is_fallback logic
    # True if we had to search globally AND we are searching by location
    has_location = bool(location_name or lat)
    found_in_location = any(u.get("distance_km") is not None or (u.get("location_name") and location_name and location_name.lower() in u["location_name"].lower()) for u in processed_users)
    
    is_fallback = has_location and not found_in_location

    logger.info(f"Final results: {len(processed_users)}, is_fallback: {is_fallback}")
    return processed_users[:40], is_fallback

