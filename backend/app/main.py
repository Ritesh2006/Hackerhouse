from fastapi import FastAPI, Depends, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.rate_limit import RateLimitMiddleware
from app.db.database import connect_to_mongo, close_mongo_connection
from app.db.indexes import create_indexes
from app.api.v1.endpoints import auth, hire, contracts, projects, chat, users, ai, github, linkedin
from app.websockets.chat_socket import chat_socket_endpoint

# Setup logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limit Middleware
app.add_middleware(RateLimitMiddleware, limit=100, window=60)

# Lifecycle Events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await create_indexes()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

# Welcome Route
@app.get("/")
async def root():
    return {
        "message": "Welcome to HackerHouse API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(hire.router, prefix=f"{settings.API_V1_STR}/hire", tags=["hire"])
app.include_router(contracts.router, prefix=f"{settings.API_V1_STR}/contracts", tags=["contracts"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(github.router, prefix=f"{settings.API_V1_STR}/github", tags=["github"])
app.include_router(linkedin.router, prefix=f"{settings.API_V1_STR}/linkedin", tags=["linkedin"])

# WebSocket Route
@app.websocket("/ws/chat/{contract_id}")
async def websocket_endpoint(websocket: WebSocket, contract_id: str, token: str):
    await chat_socket_endpoint(websocket, contract_id, token)
