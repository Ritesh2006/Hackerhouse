from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    budget: Optional[str] = None
    deadline: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectInDB(ProjectBase):
    id: str = Field(alias="_id")
    client_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "open" # "open", "in_progress", "completed", "cancelled"

    class Config:
        populate_by_name = True

class ProjectResponse(ProjectBase):
    id: str
    client_id: str
    created_at: datetime
    status: str

class ContractBase(BaseModel):
    project_id: str
    client_id: str
    developer_id: str
    status: str = "pending" # "pending", "active", "completed", "disputed"

class ContractInDB(ContractBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
