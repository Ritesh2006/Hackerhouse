from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Project(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    title: str
    description: str
    budget: float
    deadline: datetime
    client_id: str
    developer_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "created"  # created, in_progress, completed, cancelled
