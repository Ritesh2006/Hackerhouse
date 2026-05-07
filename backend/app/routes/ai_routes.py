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
        
        # Prepare comprehensive system prompt with full website details
        system_content = (
            "You are SoulLink AI, the elite intelligent assistant for HackerHouse. "
            "HackerHouse is a premium platform designed to connect top-tier developers with local opportunities "
            "using GitHub intelligence and GPS proximity.\n\n"
            "Key Platform Features you should know about:\n"
            "1. GitHub Intelligence: We analyze dev proficiency by scanning repository quality, contribution history, and language expertise.\n"
            "2. GPS Proximity Matching: We help users find 'elite developers near them' by ranking engineers based on physical distance and city location.\n"
            "3. Real-time Collaboration: The platform includes global and private chat systems, project dashboards, and contract management tools.\n"
            "4. Search & Discovery: Users can search by skill (e.g., React, Python, ML) or by developer name.\n"
            "5. Verified Profiles: Every developer profile is linked to GitHub, showing their real-world impact and repo stats.\n\n"
            "Your personality: You are professional, highly technical, helpful, and optimistic about the future of collaboration. "
            "Assist users in navigating the platform, explaining features, or brainstorming tech solutions."
        )
        messages = [{"role": "system", "content": system_content}]
        
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
            model="llama-3.1-8b-instant",
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
