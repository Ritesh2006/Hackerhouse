from fastapi import APIRouter, Depends
from app.db.database import get_database
from app.repositories.project_repo import ProjectRepository
from app.services.project_service import ProjectService
from app.deps.auth_dep import get_current_user

router = APIRouter()

@router.get("/me")
async def get_my_projects(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ProjectService(ProjectRepository(db))
    return await service.get_my_projects(current_user["_id"], current_user["role"])

@router.get("/{id}")
async def get_project(
    id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ProjectService(ProjectRepository(db))
    return await service.get_project(id)
