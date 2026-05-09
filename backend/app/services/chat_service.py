from app.repositories.chat_repo import ChatRepository
from datetime import datetime, UTC

class ChatService:
    def __init__(self, chat_repo: ChatRepository):
        self.chat_repo = chat_repo

    async def get_chat_by_contract(self, contract_id: str):
        return await self.chat_repo.get_by_contract(contract_id)

    async def save_message(self, chat_id: str, sender_id: str, text: str):
        message = {
            "sender_id": sender_id,
            "text": text,
            "timestamp": datetime.now(UTC)
        }
        await self.chat_repo.add_message(chat_id, message)
        return message
