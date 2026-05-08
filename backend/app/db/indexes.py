from app.db.database import db
import logging

logger = logging.getLogger(__name__)

async def create_indexes():
    try:
        # Users indexes
        await db.db.users.create_index([("location", "2dsphere")])
        await db.db.users.create_index("skills")
        
        # Drop existing email index to update its specification (sparse: true)
        try:
            await db.db.users.drop_index("email_1")
        except Exception:
            pass # Index might not exist yet
            
        await db.db.users.create_index("email", unique=True, sparse=True)
        
        # Projects indexes
        await db.db.projects.create_index("client_id")
        await db.db.projects.create_index("developer_id")
        
        # Contracts indexes
        await db.db.contracts.create_index("client_id")
        await db.db.contracts.create_index("developer_id")
        await db.db.contracts.create_index("status")
        
        # Chats indexes
        await db.db.chats.create_index("contract_id")
        
        logger.info("Database indexes created successfully.")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
