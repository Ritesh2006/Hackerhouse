from ..core.database import get_database
from ..utils.geo_utils import haversine_distance
from ..services.github_service import search_github_users
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
    db = get_database()
    query = {"role": "developer"}

    if skills:
        query["skills"] = {"$in": [re.compile(s, re.IGNORECASE) for s in skills]}
    
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    else:
        # Only apply location filters if NOT searching by specific name
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
            # Simple text search for location name in local DB
            query["location_name"] = {"$regex": location_name, "$options": "i"}

    cursor = db.users.find(query)
    users = await cursor.to_list(length=50)
    logger.info(f"Local query found {len(users)} users")
    
    # If we have few local users, fetch from GitHub to ensure a rich results page
    if len(users) < 50:
        logger.info(f"Fetching from GitHub for {location_name} / {skills} / {name}")
        
        # If no skills provided, use name or broad set of popular skills to show "all types"
        search_skill = skills[0] if skills else (name if name else "react+python+node+typescript")
        
        # GitHub search: Ignore location if searching by name
        gh_search_location = None if name else location_name
        if gh_search_location and "," in gh_search_location:
            gh_search_location = gh_search_location.split(",")[-1].strip()
            
        gh_users = await search_github_users(skill=search_skill, location=gh_search_location)
        logger.info(f"GitHub found {len(gh_users)} users")
        
        for gh_user in gh_users:
            # Map GitHub format to local User format
            mapped_user = {
                "id": f"gh_{gh_user['username']}",
                "name": gh_user["name"] or gh_user["username"],
                "github_username": gh_user["username"],
                "bio": gh_user["bio"],
                "avatar_url": gh_user["avatar_url"],
                "skills": gh_user["languages"],
                "role": "developer",
                "location_name": location_name or "Remote",
                "distance_km": None
            }
            # Only add if not already in local results (by username)
            if not any(u.get("github_username") == mapped_user["github_username"] for u in users):
                users.append(mapped_user)

    # Fallback: if search was too specific (e.g. non-coding skill like 'artist') and yielded nothing, fetch nearest profiles
    if len(users) == 0 and skills:
        logger.info("Skill search yielded 0 results, falling back to nearest profiles")
        fallback_query = {"role": "developer"}
        if lat is not None and lon is not None:
            fallback_query["location"] = query["location"]
        elif location_name:
            fallback_query["location_name"] = query["location_name"]
            
        cursor = db.users.find(fallback_query)
        users = await cursor.to_list(length=30)

    # Calculate exact distance for sorting/display
    for user in users:
        if "_id" in user:
            user["id"] = str(user.pop("_id"))
        
        if lat is not None and lon is not None and user.get("location"):
            u_lon, u_lat = user["location"]["coordinates"]
            user["distance_km"] = haversine_distance(lat, lon, u_lat, u_lon)
        elif "distance_km" not in user:
            user["distance_km"] = None

    return users
