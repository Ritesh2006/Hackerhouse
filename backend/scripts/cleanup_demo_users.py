import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load env from parent directory if needed
load_dotenv(".env")
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hackerhouse")

async def cleanup():
    if not MONGO_URI:
        print("Error: MONGO_URI not found in environment.")
        return

    print(f"Connecting to MongoDB: {DATABASE_NAME}...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]

    # Delete users that are considered "demo"
    # Usually these are users without a real email or with specific patterns
    # For now, we'll delete users that don't have a linked github or linkedin ID 
    # OR we can delete everything if the user wants a fresh start.
    # Given the request "remove all demo git hub account", I'll remove users 
    # who don't have a verified source.
    
    # Let's find them first
    total_users = await db.users.count_documents({})
    print(f"Total users in database: {total_users}")

    # Remove users that look like demo users (e.g., no password or generic names)
    # OR just remove all users if the goal is to start with only real API accounts.
    # I'll be conservative and remove users with 'example.com' emails or 'demo' in name
    demo_query = {
        "$or": [
            {"email": {"$regex": "@hackerhouse.io", "$options": "i"}},
            {"github_username": {"$regex": "^dev\\d+_gh$", "$options": "i"}},
            {"email": {"$regex": "example.com", "$options": "i"}},
            {"name": {"$regex": "demo", "$options": "i"}},
            {"is_demo": True}
        ]
    }
    
    deleted = await db.users.delete_many(demo_query)
    print(f"Deleted {deleted.deleted_count} demo users.")

    # If the user wants to remove ALL and only use real accounts:
    # await db.users.delete_many({}) 
    
    client.close()
    print("Cleanup complete.")

if __name__ == "__main__":
    asyncio.run(cleanup())
