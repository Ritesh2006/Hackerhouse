from app.repositories.project_repo import ProjectRepository
from app.repositories.contract_repo import ContractRepository
from app.repositories.chat_repo import ChatRepository
from app.repositories.user_repo import UserRepository
from app.schemas.project import ProjectCreate
from fastapi import HTTPException, status
from datetime import datetime, UTC
import logging

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
        try:
            developer_id = hire_data.developer_id
            logging.info(f"Hiring process started: client={client_id}, developer={developer_id}")
            
            # 1. Validate developer (Handle virtual IDs)
            developer = await self.user_repo.get_by_id(developer_id)
            
            if not developer and (developer_id.startswith("gh_") or developer_id.startswith("li_")):
                # It's a virtual user not yet in our DB, create them
                if developer_id.startswith("gh_"):
                    from app.services.github_service import get_github_user_data
                    username = developer_id.replace("gh_", "")
                    gh_data = await get_github_user_data(username)
                    if gh_data:
                        developer_data = {
                            "_id": developer_id,
                            "name": gh_data.get("name") or username,
                            "email": gh_data.get("email"),
                            "role": "developer",
                            "skills": gh_data.get("languages", []),
                            "bio": gh_data.get("bio"),
                            "avatar_url": gh_data.get("avatar_url"),
                            "github_username": username,
                            "location_name": gh_data.get("location"),
                            "created_at": datetime.now(UTC),
                            "is_active": True
                        }
                        await self.user_repo.create(developer_data)
                        developer = developer_data

                elif developer_id.startswith("li_"):
                    from app.services.linkedin_service import get_linkedin_profile
                    li_profile = await get_linkedin_profile()
                    name = "LinkedIn Developer"
                    if li_profile and not li_profile.get("is_fallback"):
                        name = f"{li_profile.get('first_name', '')} {li_profile.get('last_name', '')}".strip()
                        
                    developer_data = {
                        "_id": developer_id,
                        "name": name,
                        "role": "developer",
                        "skills": li_profile.get("skills", []) if li_profile else [],
                        "bio": li_profile.get("headline", "Verified LinkedIn Professional Profile") if li_profile else "Verified LinkedIn Professional Profile",
                        "avatar_url": li_profile.get("profile_picture") if li_profile else None,
                        "is_active": True,
                        "created_at": datetime.now(UTC)
                    }
                    await self.user_repo.create(developer_data)
                    developer = developer_data

            if not developer or developer.get("role") != "developer":
                logging.error(f"Invalid developer for hire: {developer_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid developer ID"
                )

            # 2. Sequential Creation (IDs are dependent)
            now = datetime.now(UTC)
            
            project_id = await self.project_repo.create({
                "title": hire_data.title,
                "description": hire_data.description,
                "budget": hire_data.budget,
                "deadline": hire_data.deadline,
                "client_id": client_id,
                "developer_id": developer_id,
                "status": "created",
                "created_at": now
            })

            contract_id = await self.contract_repo.create({
                "project_id": project_id,
                "client_id": client_id,
                "developer_id": developer_id,
                "budget": hire_data.budget,
                "deadline": hire_data.deadline,
                "status": "pending",
                "created_at": now
            })

            await self.chat_repo.create({
                "contract_id": contract_id,
                "participants": [client_id, developer_id],
                "messages": [],
                "created_at": now,
                "updated_at": now
            })

            logging.info(f"Hiring successful: project={project_id}, contract={contract_id}")
            return {"project_id": project_id, "contract_id": contract_id}
            
        except Exception as e:
            logging.error(f"CRITICAL ERROR in hire_developer: {str(e)}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Hiring failed: {str(e)}"
            )
