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
    
    # 2. INTEGRATE REAL GITHUB DATA
    github_users = []
    if skills or location_name or name:
        try:
            search_skill = skills[0] if skills else None
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
        except Exception as e:
            logger.error(f"GitHub search failed: {e}")

    # 3. INTEGRATE LINKEDIN DATA (Verified Account)
    linkedin_users = []
    from app.services.linkedin_service import get_linkedin_profile
    li_profile = await get_linkedin_profile()
    if li_profile and not li_profile.get("is_fallback"):
        li_name = f"{li_profile.get('first_name', '')} {li_profile.get('last_name', '')}".strip()
        # Add if name matches or no name filter
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

    # Step 4: Local Fallback (Global) if no results found
    if not local_users and not github_users and not linkedin_users:
        logger.info("No matches found. Expanding search.")
        is_fallback = True
        local_users = await search_local(apply_location=False)

    # 5. Merge and Deduplicate
    all_users = []
    seen_ids = set()
    
    # 1. LinkedIn (Highest Priority)
    for lu in linkedin_users:
        all_users.append(lu)
        seen_ids.add(lu["id"])

    # 2. Local users
    for u in local_users:
        u_id = str(u.pop("_id")) if "_id" in u else u.get("id")
        u["id"] = u_id
        if u_id not in seen_ids:
            all_users.append(u)
            seen_ids.add(u_id)
        
    # 3. GitHub users
    for gu in github_users:
        if gu["id"] not in seen_ids:
            all_users.append(gu)
            seen_ids.add(gu["id"])

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

