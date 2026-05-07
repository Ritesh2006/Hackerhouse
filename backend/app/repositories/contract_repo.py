from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from app.db.utils import get_id_query

class ContractRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.contracts

    async def create(self, contract_data: dict) -> str:
        if "_id" not in contract_data:
            contract_data["_id"] = str(ObjectId())
        await self.collection.insert_one(contract_data)
        return contract_data["_id"]

    async def get_by_id(self, contract_id: str) -> Optional[dict]:
        return await self.collection.find_one(get_id_query(contract_id))

    async def get_by_user(self, user_id: str, skip: int = 0, limit: int = 20) -> List[dict]:
        cursor = self.collection.find(
            {"$or": [{"client_id": user_id}, {"developer_id": user_id}]}
        ).skip(skip).limit(limit).sort("created_at", -1)
        return await cursor.to_list(length=limit)

    async def update_status(self, contract_id: str, status: str, **kwargs) -> bool:
        update_data = {"status": status}
        if status == "accepted":
            update_data["accepted_at"] = datetime.utcnow()
        elif status == "active":
            update_data["started_at"] = datetime.utcnow()
        elif status == "completed":
            update_data["completed_at"] = datetime.utcnow()
        
        update_data.update(kwargs)
        
        result = await self.collection.update_one(
            get_id_query(contract_id), {"$set": update_data}
        )
        return result.modified_count > 0
