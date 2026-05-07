from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageSchema(BaseModel):
    sender_id: str
    text: str
    timestamp: datetime

class ChatResponse(BaseModel):
    id: str
    contract_id: str
    participants: List[str]
    messages: List[MessageSchema]
    created_at: datetime
    updated_at: datetime
