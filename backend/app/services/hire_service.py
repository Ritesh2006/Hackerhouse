from app.repositories.project_repo import ProjectRepository
from app.repositories.contract_repo import ContractRepository
from app.repositories.chat_repo import ChatRepository
from app.repositories.user_repo import UserRepository
from app.schemas.project import ProjectCreate
from fastapi import HTTPException, status
from datetime import datetime

class HireService:
    def __init__(
        self, 
        project_repo: ProjectRepository, 
        contract_repo: ContractRepository,
        chat_repo: ChatRepository,
        user_repo: UserRepository
    ):
        self.project_repo = project_repo
        self.contract_repo = contract_repo
        self.chat_repo = chat_repo
        self.user_repo = user_repo

    async def hire_developer(self, client_id: str, hire_data: ProjectCreate):
        # 1. Validate developer
        developer = await self.user_repo.get_by_id(hire_data.developer_id)
        if not developer or developer["role"] != "developer":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid developer ID"
            )

        # 2. Create Project
        project_data = {
            "title": hire_data.title,
            "description": hire_data.description,
            "budget": hire_data.budget,
            "deadline": hire_data.deadline,
            "client_id": client_id,
            "developer_id": hire_data.developer_id,
            "status": "created",
            "created_at": datetime.utcnow()
        }
        project_id = await self.project_repo.create(project_data)

        # 3. Create Contract
        contract_data = {
            "project_id": project_id,
            "client_id": client_id,
            "developer_id": hire_data.developer_id,
            "budget": hire_data.budget,
            "deadline": hire_data.deadline,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        contract_id = await self.contract_repo.create(contract_data)

        # 4. Create Chat Room
        chat_data = {
            "contract_id": contract_id,
            "participants": [client_id, hire_data.developer_id],
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await self.chat_repo.create(chat_data)

        return {"project_id": project_id, "contract_id": contract_id}
