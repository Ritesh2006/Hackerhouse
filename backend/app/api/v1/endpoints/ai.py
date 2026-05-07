from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings
import groq
import logging
import asyncio

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
        return {"reply": "I'm sorry, my AI service is currently being configured. Please try again in a few minutes! (Error: API Key missing)"}
    
    try:
        # Use a timeout for the AI call to prevent hanging
        client = groq.AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        system_content = (
            "You are SoulLink AI, the elite intelligent assistant for HackerHouse. "
            "HackerHouse is a premium platform designed to connect top-tier developers with local opportunities "
            "using GitHub intelligence and GPS proximity.\n\n"
            "Your personality: Professional, highly technical, helpful, and optimistic."
        )
        messages = [{"role": "system", "content": system_content}]
        
        for msg in request.history:
            role = msg.get("role", "user")
            messages.append({"role": role, "content": msg.get("content", "")})
            
        messages.append({"role": "user", "content": request.message})
        
        # Set a 15 second timeout for the AI response
        chat_completion = await asyncio.wait_for(
            client.chat.completions.create(
                messages=messages,
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=1024,
            ),
            timeout=15.0
        )
        
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
        
    except asyncio.TimeoutError:
        logger.error("AI Service Timeout")
        return {"reply": "I'm thinking a bit too hard right now and timed out. Could you try asking that again?"}
    except Exception as e:
        logger.error(f"AI Service Error: {str(e)}")
        return {"reply": "I encountered a technical glitch while processing your request. I'm still here though! How else can I help?"}
