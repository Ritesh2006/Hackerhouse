from fastapi import APIRouter, Depends
from app.db.database import get_database
from app.repositories.contract_repo import ContractRepository
from app.repositories.project_repo import ProjectRepository
from app.services.contract_service import ContractService
from app.deps.auth_dep import get_current_user
from app.deps.pagination import PaginationParams

router = APIRouter()

@router.get("/me")
async def get_my_contracts(
    current_user=Depends(get_current_user),
    params: PaginationParams = Depends(),
    db=Depends(get_database)
):
    service = ContractService(ContractRepository(db), ProjectRepository(db))
    return await service.get_my_contracts(current_user["_id"], params.skip, params.limit)

@router.post("/{id}/accept")
async def accept_contract(
    id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ContractService(ContractRepository(db), ProjectRepository(db))
    return await service.accept_contract(current_user["_id"], id)

@router.post("/{id}/start")
async def start_contract(
    id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ContractService(ContractRepository(db), ProjectRepository(db))
    return await service.start_contract(current_user["_id"], id)

@router.post("/{id}/complete")
async def complete_contract(
    id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ContractService(ContractRepository(db), ProjectRepository(db))
    return await service.complete_contract(current_user["_id"], id)
