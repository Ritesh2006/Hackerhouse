from fastapi import WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
from app.db.database import get_database
from app.repositories.chat_repo import ChatRepository
from app.services.chat_service import ChatService
from jose import jwt
from app.core.config import settings

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

async def chat_socket_endpoint(websocket: WebSocket, contract_id: str, token: str):
    # 1. Validate token
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=1008)
        return

    # 2. Get DB and Service
    db = await get_database()
    chat_repo = ChatRepository(db)
    chat_service = ChatService(chat_repo)
    
    # 3. Check if chat exists and user is participant
    chat = await chat_repo.get_by_contract(contract_id)
    if not chat or user_id not in chat["participants"]:
        await websocket.close(code=1008)
        return

    room_id = str(chat["_id"])
    await manager.connect(websocket, room_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to DB
            saved_message = await chat_service.save_message(
                chat_id=room_id,
                sender_id=user_id,
                text=message_data["text"]
            )
            
            # Broadcast to room
            await manager.broadcast(json.dumps({
                "sender_id": user_id,
                "text": message_data["text"],
                "timestamp": str(saved_message["timestamp"]),
                "linkedin_status": saved_message.get("linkedin_status")
            }), room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
