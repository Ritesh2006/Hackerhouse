from fastapi import APIRouter, Depends
from app.db.database import get_database
from app.repositories.chat_repo import ChatRepository
from app.services.chat_service import ChatService
from app.deps.auth_dep import get_current_user

router = APIRouter()

@router.get("/contract/{contract_id}")
async def get_chat_by_contract(
    contract_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ChatService(ChatRepository(db))
    return await service.get_chat_by_contract(contract_id)
