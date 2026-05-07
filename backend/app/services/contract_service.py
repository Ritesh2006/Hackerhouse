from app.repositories.contract_repo import ContractRepository
from app.repositories.project_repo import ProjectRepository
from fastapi import HTTPException, status

class ContractService:
    def __init__(self, contract_repo: ContractRepository, project_repo: ProjectRepository):
        self.contract_repo = contract_repo
        self.project_repo = project_repo

    async def accept_contract(self, user_id: str, contract_id: str):
        contract = await self.contract_repo.get_by_id(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        if contract["developer_id"] != user_id:
            raise HTTPException(status_code=403, detail="Only the developer can accept the contract")
        
        if contract["status"] != "pending":
            raise HTTPException(status_code=400, detail="Contract is not in pending status")

        await self.contract_repo.update_status(contract_id, "accepted")
        await self.project_repo.update_status(contract["project_id"], "in_progress")
        return {"status": "accepted"}

    async def start_contract(self, user_id: str, contract_id: str):
        contract = await self.contract_repo.get_by_id(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        if contract["status"] != "accepted":
            raise HTTPException(status_code=400, detail="Contract must be accepted first")

        await self.contract_repo.update_status(contract_id, "active")
        return {"status": "active"}

    async def complete_contract(self, user_id: str, contract_id: str):
        contract = await self.contract_repo.get_by_id(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        await self.contract_repo.update_status(contract_id, "completed")
        await self.project_repo.update_status(contract["project_id"], "completed")
        return {"status": "completed"}

    async def get_my_contracts(self, user_id: str, skip: int = 0, limit: int = 20):
        return await self.contract_repo.get_by_user(user_id, skip, limit)
