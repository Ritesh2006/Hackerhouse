from fastapi import APIRouter, WebSocket, Query, Body, HTTPException
from ..websockets.chat_socket import chat_endpoint
from ..core.database import get_database
from typing import List
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class DirectMessage(BaseModel):
    room_id: str
    sender_id: str
    message: str

@router.websocket("/ws/{room_id}")
async def websocket_route(websocket: WebSocket, room_id: str, user_id: str = Query(...)):
    await chat_endpoint(websocket, room_id, user_id)

@router.get("/history/{room_id}")
async def get_chat_history(room_id: str, limit: int = 50):
    db = get_database()
    cursor = db.chats.find({"room_id": room_id}).sort("timestamp", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    for m in messages:
        m["id"] = str(m.pop("_id"))
        m["timestamp"] = m["timestamp"].isoformat()
    return messages[::-1] # return in chronological order

@router.post("/send")
async def send_direct_message(dm: DirectMessage):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    try:
        chat_msg = {
            "room_id": dm.room_id,
            "sender_id": dm.sender_id,
            "message": dm.message,
            "timestamp": datetime.utcnow(),
            "type": "text"
        }
        result = await db.chats.insert_one(chat_msg)
        return {"status": "sent", "id": str(result.inserted_id)}
    except Exception as e:
        import logging
        logging.error(f"Failed to store message: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
