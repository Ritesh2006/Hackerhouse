from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ContractResponse(BaseModel):
    id: str
    project_id: str
    client_id: str
    developer_id: str
    budget: float
    deadline: datetime
    status: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
