from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from bson import ObjectId

class ProjectRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.projects

    async def create(self, project_data: dict) -> str:
        if "_id" not in project_data:
            project_data["_id"] = str(ObjectId())
        await self.collection.insert_one(project_data)
        return project_data["_id"]

    async def get_by_id(self, project_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": project_id})

    async def get_by_user(self, user_id: str, role: str) -> List[dict]:
        query = {"client_id": user_id} if role == "client" else {"developer_id": user_id}
        cursor = self.collection.find(query)
        return await cursor.to_list(length=100)

    async def update_status(self, project_id: str, status: str) -> bool:
        result = await self.collection.update_one(
            {"_id": project_id}, {"$set": {"status": status}}
        )
        return result.modified_count > 0
