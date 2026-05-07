from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from datetime import datetime
from ..core.database import get_database

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

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

async def chat_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(websocket, room_id)
    db = get_database()
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Store in MongoDB
            chat_msg = {
                "room_id": room_id,
                "sender_id": user_id,
                "message": message_data.get("message"),
                "timestamp": datetime.utcnow(),
                "type": message_data.get("type", "text") # "text" or "typing"
            }
            
            if chat_msg["type"] == "text":
                if db is not None:
                    try:
                        await db.chats.insert_one(chat_msg)
                        logger.info(f"Message stored in DB: {chat_msg['message'][:20]}...")
                    except Exception as e:
                        logger.error(f"Failed to store WebSocket message: {e}")
                else:
                    logger.error("Database connection lost in WebSocket handler")
            
            # Broadcast to room
            await manager.broadcast(json.dumps({
                "sender_id": user_id,
                "message": chat_msg["message"],
                "timestamp": chat_msg["timestamp"].isoformat(),
                "type": chat_msg["type"]
            }), room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(json.dumps({"info": f"User {user_id} left"}), room_id)
