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

    # Helper function for primary search
    async def search(apply_location=True):
        query = {"role": "developer"}
        
        # 1. Skill Match Improvement: lowercase and partial matching
        if skills:
            skill_queries = []
            for s in skills:
                clean_s = s.lower().strip()
                skill_queries.append(re.compile(f".*{clean_s}.*", re.IGNORECASE))
            query["skills"] = {"$in": skill_queries}
        
        if name:
            query["name"] = {"$regex": name, "$options": "i"}

        # 2. Location Filtering
        if apply_location:
            if lat is not None and lon is not None:
                query["location"] = {
                    "$near": {
                        "$geometry": {
                            "type": "Point",
                            "coordinates": [lon, lat]
                        },
                        "$maxDistance": max_distance_km * 1000 # convert to meters
                    }
                }
            elif location_name:
                query["location_name"] = {"$regex": location_name, "$options": "i"}

        cursor = db.users.find(query)
        if not apply_location:
            cursor = cursor.sort("rating", -1)
            
        return await cursor.to_list(length=50)

    # Step 1: Primary Search (Skills + Location)
    users = await search(apply_location=True)
    
    # Step 2: Fallback System
    if not users:
        logger.info("Fallback Level 1: Global Skill Search")
        is_fallback = True
        users = await search(apply_location=False)
        
    if not users:
        logger.info("Fallback Level 2: Top Rated Developers")
        is_fallback = True
        cursor = db.users.find({"role": "developer"}).sort("rating", -1).limit(20)
        users = await cursor.to_list(length=20)

    # Step 3: Fallback Level 3 - GitHub Search Integration (CRITICAL)
    # If we still have very few results, supplement with GitHub users
    if len(users) < 3 and skills:
        logger.info(f"Fallback Level 3: Fetching from GitHub for skill '{skills[0]}'")
        is_fallback = True
        try:
            gh_users = await search_github_users(skill=skills[0], location=location_name)
            for gh_user in gh_users:
                # Map GitHub user to our internal format with a virtual ID
                virtual_id = f"gh_{gh_user['username']}"
                
                # Check if this user already exists in our results (by github_username)
                if any(u.get("github_username") == gh_user["username"] for u in users):
                    continue
                
                users.append({
                    "id": virtual_id,
                    "name": gh_user.get("name") or gh_user["username"],
                    "full_name": gh_user.get("name") or gh_user["username"],
                    "github_username": gh_user["username"],
                    "avatar_url": gh_user.get("avatar_url"),
                    "skills": gh_user.get("languages", []),
                    "bio": gh_user.get("bio"),
                    "location_name": gh_user.get("location") or "GitHub",
                    "rating": 4.8, # Default high rating for GitHub talent
                    "hourly_rate": 85,
                    "public_repos": gh_user.get("public_repos", 0),
                    "total_stars": gh_user.get("total_stars", 0),
                    "role": "developer",
                    "is_virtual": True
                })
        except Exception as e:
            logger.error(f"GitHub fallback search failed: {e}")

    # Final processing: Ensure ID field is consistent
    processed_users = []
    for user in users:
        # Convert _id to id for MongoDB results
        if "_id" in user:
            user["id"] = str(user.pop("_id"))
        
        # Ensure id exists (should already be there for virtual users)
        if "id" not in user:
            user["id"] = f"user_{uuid.uuid4().hex[:8]}"

        # Calculate distance if coordinates are available
        if lat is not None and lon is not None and user.get("location"):
            u_lon, u_lat = user["location"]["coordinates"]
            user["distance_km"] = haversine_distance(lat, lon, u_lat, u_lon)
        else:
            user["distance_km"] = None
            
        processed_users.append(user)

    logger.info(f"Final response count: {len(processed_users)}, is_fallback: {is_fallback}")
    return processed_users, is_fallback
