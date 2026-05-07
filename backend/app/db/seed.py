import random
import logging
from app.db.database import get_database
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

# Coordinates for locations in India
LOCATIONS = {
    "Kolkata": [88.3639, 22.5726],
    "Durgapur": [87.3217, 23.4846],
    "Bishnupur": [87.3200, 23.0673],
    "Delhi": [77.1025, 28.7041],
    "Bangalore": [77.5946, 12.9716],
    "Mumbai": [72.8777, 19.0760],
    "Chennai": [80.2707, 13.0827],
    "Hyderabad": [78.4867, 17.3850],
}

SKILLS_POOL = [
    "react", "node", "python", "java", "typescript", 
    "mongodb", "postgresql", "docker", "aws", "nextjs",
    "tailwind", "fastapi", "express", "go", "rust"
]

NAMES = [
    "Aarav", "Advik", "Akash", "Arjun", "Ishaan", "Vihaan", "Pranav", "Sai", 
    "Ananya", "Diya", "Isha", "Kavya", "Myra", "Saanvi", "Zoya", "Ritesh",
    "Amit", "Priya", "Rahul", "Sneha", "Vikram", "Neha", "Sanjay", "Anjali"
]

async def seed_developers():
    db = await get_database()
    count = await db.users.count_documents({"role": "developer"})
    
    if count >= 20:
        logger.info(f"Database already has {count} developers. Skipping seed.")
        return

    logger.info("Seeding database with developers...")
    
    developers = []
    for i in range(25):
        name = random.choice(NAMES) + " " + chr(65 + i % 26)
        loc_name = random.choice(list(LOCATIONS.keys()))
        coords = LOCATIONS[loc_name]
        
        # Add slight jitter to coordinates so they aren't all in the same spot
        coords = [coords[0] + random.uniform(-0.05, 0.05), coords[1] + random.uniform(-0.05, 0.05)]
        
        skills = random.sample(SKILLS_POOL, random.randint(3, 6))
        # Ensure some have common requested skills
        if i % 3 == 0: skills.append("react")
        if i % 4 == 0: skills.append("python")
        if i % 5 == 0: skills.append("java")
        skills = list(set(skills))
        
        dev = {
            "name": name,
            "full_name": name,
            "email": f"dev{i+1}@hackerhouse.io",
            "hashed_password": get_password_hash("password123"),
            "role": "developer",
            "skills": skills,
            "location": {
                "type": "Point",
                "coordinates": coords
            },
            "location_name": loc_name,
            "github_username": f"dev{i+1}_gh",
            "rating": round(random.uniform(3.5, 5.0), 1),
            "hourly_rate": random.randint(20, 150),
            "bio": f"Senior Full Stack Developer based in {loc_name}. Specialized in {', '.join(skills[:3])}.",
            "is_active": True,
            "created_at": "2024-01-01T00:00:00Z"
        }
        developers.append(dev)
    
    if developers:
        await db.users.insert_many(developers)
        logger.info(f"Successfully seeded {len(developers)} developers.")
