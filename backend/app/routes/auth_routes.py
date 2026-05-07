from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.auth_schema import LoginRequest, RegisterRequest, Token
from ..schemas.user_schema import UserResponse
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.database import get_database
from datetime import timedelta
from ..core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest):
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = request.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    created_user["id"] = str(created_user.pop("_id"))
    return created_user

@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    db = get_database()
    user = await db.users.find_one({"email": request.email})
    
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
