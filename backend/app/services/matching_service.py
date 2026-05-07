from app.db.database import get_database
from app.utils.geo_utils import haversine_distance
from app.services.github_service import search_github_users
from typing import List, Optional
import uuid
import logging

logger = logging.getLogger(__name__)

import re

async def find_matching_developers(
    skills: Optional[List[str]] = None,
    name: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    location_name: Optional[str] = None,
    max_distance_km: float = 100.0
):
    db = await get_database()
    is_fallback = False
    
    logger.info(f"Incoming search params: skills={skills}, location={location_name}, lat={lat}, lon={lon}")

    # Helper function for primary search
    async def search(apply_location=True):
        query = {"role": "developer"}
        
        # 1. Skill Match Improvement: lowercase and partial matching
        if skills:
            # Create regex for each skill to allow partial matching (e.g. "react" matches "reactjs")
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
            # Sort by rating for global fallback
            cursor = cursor.sort("rating", -1)
            
        return await cursor.to_list(length=50)

    # Step 1: Primary Search (Skills + Location)
    users = await search(apply_location=True)
    logger.info(f"Primary search found {len(users)} results")

    # Step 2: Fallback System (CRITICAL)
    if not users:
        logger.info("No exact matches found. Triggering fallback level 1 (Global Skill Search)...")
        is_fallback = True
        users = await search(apply_location=False)
        
        if not users:
            logger.info("Still no results. Triggering fallback level 2 (Top Rated Developers)...")
            # Return top rated developers regardless of skills
            cursor = db.users.find({"role": "developer"}).sort("rating", -1).limit(20)
            users = await cursor.to_list(length=20)

    # Calculate exact distance for sorting/display
    for user in users:
        if "_id" in user:
            user["id"] = str(user.pop("_id"))
        
        if lat is not None and lon is not None and user.get("location"):
            u_lon, u_lat = user["location"]["coordinates"]
            user["distance_km"] = haversine_distance(lat, lon, u_lat, u_lon)
        else:
            user["distance_km"] = None

    logger.info(f"Final response count: {len(users)}, is_fallback: {is_fallback}")
    return users, is_fallback
