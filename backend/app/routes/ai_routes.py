from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.config import settings
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
        
        # Prepare messages
        messages = [{"role": "system", "content": "You are a helpful, modern AI assistant for HackerHouse, a platform for developers and tech enthusiasts. Be concise, professional, and helpful."}]
        
        # Add history if provided
        for msg in request.history:
            role = msg.get("role")
            if role not in ["user", "assistant", "system"]:
                role = "user"
            messages.append({"role": role, "content": msg.get("content", "")})
            
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        logger.info(f"Sending request to Groq with {len(messages)} messages")
        
        chat_completion = await client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=1024,
        )
        
        reply = chat_completion.choices[0].message.content
        logger.info("Successfully received reply from Groq")
        return {"reply": reply}
        
    except Exception as e:
        logger.error(f"AI Service Error: {str(e)}")
        # Provide more specific error message if it's a known Groq error
        error_detail = str(e)
        if "api_key" in error_detail.lower():
            error_detail = "Authentication failed with AI service."
        elif "rate limit" in error_detail.lower():
            error_detail = "AI service rate limit exceeded. Please try again later."
            
        raise HTTPException(status_code=500, detail=f"AI Service Error: {error_detail}")
