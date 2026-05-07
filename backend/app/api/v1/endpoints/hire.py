from fastapi import APIRouter, Depends
from app.db.database import get_database
from app.repositories.project_repo import ProjectRepository
from app.repositories.contract_repo import ContractRepository
from app.repositories.chat_repo import ChatRepository
from app.repositories.user_repo import UserRepository
from app.services.hire_service import HireService
from app.schemas.project import ProjectCreate
from app.deps.auth_dep import get_current_user

router = APIRouter()

@router.post("")
async def hire_developer(
    hire_data: ProjectCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HireService(
        ProjectRepository(db),
        ContractRepository(db),
        ChatRepository(db),
        UserRepository(db)
    )
    return await service.hire_developer(current_user["_id"], hire_data)
