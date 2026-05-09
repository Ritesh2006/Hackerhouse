from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.database import get_database
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token
from datetime import timedelta
from app.core.config import settings
from app.deps.auth_dep import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db=Depends(get_database)):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = user_in.model_dump()
    
    # Ensure full_name is set even if only name was provided
    if not user_data.get("full_name") and user_data.get("name"):
        user_data["full_name"] = user_data["name"]
    elif not user_data.get("name") and user_data.get("full_name"):
        user_data["name"] = user_data["full_name"]
        
    if not user_data.get("full_name"):
        raise HTTPException(status_code=400, detail="Name is required")
        
    user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    user_id = await user_repo.create(user_data)
    
    created_user = await user_repo.get_by_id(user_id)
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_database)):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(subject=user["_id"])
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user
