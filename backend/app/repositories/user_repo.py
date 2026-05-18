from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import User
from typing import Optional, List
from bson import ObjectId
from app.db.utils import get_id_query

class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def get_by_id(self, user_id: str) -> Optional[dict]:
        return await self.collection.find_one(get_id_query(user_id))

    async def get_by_email(self, email: str) -> Optional[dict]:
        return await self.collection.find_one({"email": email})

    async def get_by_username(self, username: str) -> Optional[dict]:
        return await self.collection.find_one({"github_username": username})

    async def create(self, user_data: dict) -> str:
        if "_id" not in user_data:
            user_data["_id"] = str(ObjectId())
        await self.collection.insert_one(user_data)
        return user_data["_id"]

    async def update(self, user_id: str, user_data: dict) -> bool:
        result = await self.collection.update_one(
            get_id_query(user_id), {"$set": user_data}
        )
        return result.modified_count > 0

    async def find_nearby_developers(self, lon: float, lat: float, max_distance: int = 10000, skills: List[str] = None) -> List[dict]:
        query = {
            "role": "developer",
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "$maxDistance": max_distance
                }
            }
        }
        if skills:
            query["skills"] = {"$in": skills}
            
        cursor = self.collection.find(query)
        return await cursor.to_list(length=100)
