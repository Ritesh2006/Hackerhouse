from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str
    budget: float
    deadline: datetime

class ProjectCreate(ProjectBase):
    developer_id: str

class ProjectResponse(ProjectBase):
    id: str
    client_id: str
    developer_id: str
    status: str
    created_at: datetime
