from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.config import settings
import groq

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: list = []

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")
    
    try:
        client = groq.AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        # Prepare messages
        messages = [{"role": "system", "content": "You are a helpful, modern AI assistant for HackerHouse, a platform for developers and tech enthusiasts."}]
        
        # Add history if provided
        for msg in request.history:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        chat_completion = await client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192", # Defaulting to llama3-8b, can be changed to llama3-70b-8192
            temperature=0.7,
            max_tokens=1024,
        )
        
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
