from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging
import asyncio
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_connection = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    try:
        db_connection.client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        await db_connection.client.admin.command('ping')
        db_connection.db = db_connection.client[settings.DATABASE_NAME]
        
        # Create indexes
        await db_connection.db.users.create_index([("location", "2dsphere")])
        await db_connection.db.users.create_index("email", unique=True)
        await db_connection.db.users.create_index("skills")
        logger.info("Connected to MongoDB and indexes created.")
    except Exception as e:
        with open("db_error.log", "a") as f:
            f.write(f"DB Error: {e}\n")
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    if db_connection.client:
        logger.info("Closing MongoDB connection...")
        db_connection.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    if db_connection.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not established. Please check MongoDB connectivity."
        )
    return db_connection.db
