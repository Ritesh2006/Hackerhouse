from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings
import groq
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: list = []

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    logger.info(f"AI Chat request: {request.message[:50]}...")
    
    if not settings.GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not configured")
        raise HTTPException(status_code=500, detail="AI Service Configuration Error: API Key missing")
    
    try:
        client = groq.AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        system_content = (
            "You are SoulLink AI, the elite intelligent assistant for HackerHouse. "
            "HackerHouse is a premium platform designed to connect top-tier developers with local opportunities "
            "using GitHub intelligence and GPS proximity.\n\n"
            "Key Platform Features:\n"
            "1. GitHub Intelligence: Analyzing dev proficiency via repo stats.\n"
            "2. GPS Proximity Matching: Finding elite developers nearby.\n"
            "3. Real-time Collaboration: Chat systems, dashboards, and contracts.\n"
            "4. Search & Discovery: Skills-based search.\n"
            "5. Verified Profiles: LinkedIn and GitHub linked.\n\n"
            "Your personality: Professional, highly technical, helpful, and optimistic."
        )
        messages = [{"role": "system", "content": system_content}]
        
        for msg in request.history:
            role = msg.get("role", "user")
            if role not in ["user", "assistant", "system"]:
                role = "user"
            messages.append({"role": role, "content": msg.get("content", "")})
            
        messages.append({"role": "user", "content": request.message})
        
        chat_completion = await client.chat.completions.create(
            messages=messages,
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1024,
        )
        
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
        
    except Exception as e:
        logger.error(f"AI Service Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
