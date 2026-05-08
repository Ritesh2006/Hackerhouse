import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv(".env")
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hackerhouse")

async def list_users():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    users = await db.users.find({}).limit(10).to_list(length=10)
    for u in users:
        print(f"ID: {u.get('_id')}, Name: {u.get('name') or u.get('full_name')}, Email: {u.get('email')}, GitHub: {u.get('github_username')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(list_users())
