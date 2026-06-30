from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timezone

class ChatRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.chats

    async def create(self, chat_data: dict) -> str:
        if "_id" not in chat_data:
            chat_data["_id"] = str(ObjectId())
        await self.collection.insert_one(chat_data)
        return chat_data["_id"]

    async def get_by_contract(self, contract_id: str) -> Optional[dict]:
        return await self.collection.find_one({"contract_id": contract_id})

    async def add_message(self, chat_id: str, message: dict) -> bool:
        result = await self.collection.update_one(
            {"_id": chat_id},
            {
                "$push": {"messages": message},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        return result.modified_count > 0

    async def get_by_id(self, chat_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": chat_id})
