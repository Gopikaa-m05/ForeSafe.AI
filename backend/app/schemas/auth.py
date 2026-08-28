from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserRegister(UserBase):
    password: str = Field(..., min_length=6, description="Password at least 6 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    id_token: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None

class FirebaseSyncRequest(BaseModel):
    id_token: Optional[str] = None
    uid: Optional[str] = None
    email: EmailStr
    full_name: str
    auth_provider: str = "firebase"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    auth_provider: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut

class MessageResponse(BaseModel):
    message: str
    status: str = "success"
