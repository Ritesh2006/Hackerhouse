from app.repositories.chat_repo import ChatRepository
from datetime import datetime, UTC

class ChatService:
    def __init__(self, chat_repo: ChatRepository):
        self.chat_repo = chat_repo

    async def get_chat_by_contract(self, contract_id: str):
        return await self.chat_repo.get_by_contract(contract_id)

    async def save_message(self, chat_id: str, sender_id: str, text: str):
        # Find the other participant in the chat
        chat = await self.chat_repo.get_by_id(chat_id)
        recipient_id = None
        if chat and "participants" in chat:
            recipient_id = next((p for p in chat["participants"] if p != sender_id), None)
            
        linkedin_status = None
        if recipient_id:
            db = self.chat_repo.collection.database
            from app.services.linkedin_service import send_linkedin_message
            try:
                linkedin_status = await send_linkedin_message(
                    sender_id=sender_id,
                    recipient_id=recipient_id,
                    message_text=text,
                    db=db
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error syncing LinkedIn message: {e}")
                linkedin_status = {
                    "synced": False,
                    "error": str(e)
                }

        message = {
            "sender_id": sender_id,
            "text": text,
            "timestamp": datetime.now(UTC)
        }
        if linkedin_status:
            message["linkedin_status"] = linkedin_status
            
        await self.chat_repo.add_message(chat_id, message)
        return message
