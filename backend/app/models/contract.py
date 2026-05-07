from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Contract(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    project_id: str
    client_id: str
    developer_id: str
    budget: float
    deadline: datetime
    status: str = "pending"  # pending, accepted, active, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
