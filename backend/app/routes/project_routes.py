from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..schemas.project_schema import ProjectCreate, ProjectResponse, ContractBase
from ..core.database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, client_id: str):
    db = get_database()
    project_dict = project.dict()
    project_dict["client_id"] = client_id
    project_dict["created_at"] = datetime.utcnow()
    project_dict["status"] = "open"
    
    result = await db.projects.insert_one(project_dict)
    created_project = await db.projects.find_one({"_id": result.inserted_id})
    created_project["id"] = str(created_project.pop("_id"))
    return created_project

@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    db = get_database()
    cursor = db.projects.find({"status": "open"})
    projects = await cursor.to_list(length=100)
    for p in projects:
        p["id"] = str(p.pop("_id"))
    return projects

@router.post("/contracts", response_model=dict)
async def create_contract(contract: ContractBase):
    db = get_database()
    contract_dict = contract.dict()
    contract_dict["created_at"] = datetime.utcnow()
    contract_dict["status"] = "pending"
    
    result = await db.contracts.insert_one(contract_dict)
    
    # Update project status
    await db.projects.update_one(
        {"_id": ObjectId(contract.project_id)},
        {"$set": {"status": "in_progress"}}
    )
    
    return {"message": "Contract created", "contract_id": str(result.inserted_id)}
