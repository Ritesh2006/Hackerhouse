from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import connect_to_mongo, close_mongo_connection
from .routes import auth_routes, user_routes, project_routes, github_routes, linkedin_routes, chat_routes
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and Shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routers
app.include_router(auth_routes.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(user_routes.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
app.include_router(project_routes.router, prefix=f"{settings.API_V1_STR}/projects", tags=["Projects"])
app.include_router(github_routes.router, prefix=f"{settings.API_V1_STR}/github", tags=["GitHub"])
app.include_router(linkedin_routes.router, prefix=f"{settings.API_V1_STR}/linkedin", tags=["LinkedIn"])
app.include_router(chat_routes.router, prefix=f"{settings.API_V1_STR}/chat", tags=["Chat"])

@app.get("/")
async def root():
    db = connect_to_mongo # not needed, just checking if initialized
    from .core.database import db_connection
    db_status = "connected" if db_connection.db is not None else "disconnected"
    return {
        "message": "HackerHouse API is running", 
        "version": "1.0.0",
        "database": db_status,
        "database_name": settings.DATABASE_NAME
    }
