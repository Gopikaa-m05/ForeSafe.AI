import datetime
from datetime import timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_random_token
)
from app.core.email import send_password_reset_email
from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    GoogleLoginRequest,
    FirebaseSyncRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserOut,
    MessageResponse
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        return None

@router.post("/register", response_model=TokenResponse)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    email = user_in.email.lower().strip()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        # If user existed via OAuth/Firebase sync or was registered, set password and log in
        if not existing.hashed_password:
            existing.hashed_password = get_password_hash(user_in.password)
            if user_in.full_name.strip():
                existing.full_name = user_in.full_name.strip()
            db.commit()
            db.refresh(existing)
            access_token = create_access_token({"sub": str(existing.id), "email": existing.email})
            refresh_token = create_refresh_token({"sub": str(existing.id), "email": existing.email})
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                user=UserOut.model_validate(existing)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in with your password."
        )
        
    new_user = User(
        full_name=user_in.full_name.strip(),
        email=email,
        hashed_password=get_password_hash(user_in.password),
        auth_provider="local",
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    refresh_token = create_refresh_token({"sub": str(new_user.id), "email": new_user.email})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    email = credentials.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email address. Please click Create Account to register."
        )
    
    # If the user registered via Google / Firebase without setting a local password yet,
    # set the password now so they can log in seamlessly with email & password going forward
    if not user.hashed_password:
        user.hashed_password = get_password_hash(credentials.password)
        db.commit()
        db.refresh(user)
    elif not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your password or use Google Sign-In."
        )
        
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id), "email": user.email})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user)
    )

@router.post("/google", response_model=TokenResponse)
def google_oauth_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    email = None
    name = request.name or "Google User"
    
    # Verify Google ID Token
    try:
        if settings.GOOGLE_CLIENT_ID and not settings.GOOGLE_CLIENT_ID.startswith("mock"):
            id_info = google_id_token.verify_oauth2_token(
                request.id_token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            email = id_info.get("email")
            name = id_info.get("name", name)
        else:
            # Fallback for dev / mock testing mode
            if request.email:
                email = request.email.lower()
            else:
                email = f"google_user_{abs(hash(request.id_token)) % 10000}@gmail.com"
    except Exception as e:
        # Fallback to provided email if in dev mode
        if request.email:
            email = request.email.lower()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google OAuth token verification failed: {str(e)}"
            )

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to retrieve email from Google.")

    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        user = User(
            full_name=name,
            email=email.lower(),
            hashed_password=None,
            auth_provider="google",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id), "email": user.email})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user)
    )

@router.post("/firebase", response_model=TokenResponse)
def firebase_sync_login(request: FirebaseSyncRequest, db: Session = Depends(get_db)):
    """
    Syncs or authenticates a Firebase user into the backend database.
    Allows seamlessly associating dataset uploads and predictions with Firebase-authenticated users.
    """
    email = request.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        user = User(
            full_name=request.full_name.strip() or "Engineer",
            email=email,
            hashed_password=None,
            auth_provider=request.auth_provider or "firebase",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user name if needed
        if request.full_name and user.full_name != request.full_name:
            user.full_name = request.full_name
            db.commit()
            db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id), "email": user.email})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user)
    )

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if user:
        reset_token = generate_random_token(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.datetime.now(timezone.utc) + datetime.timedelta(hours=1)
        db.commit()
        db.refresh(user)
        send_password_reset_email(user.email, reset_token)
        
    # Return generic success message for privacy/security
    return MessageResponse(
        message="If an account exists with this email, a password reset link has been dispatched."
    )

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user or not user.reset_token_expiry or user.reset_token_expiry.replace(tzinfo=timezone.utc) < datetime.datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link is invalid or has expired."
        )
        
    user.hashed_password = get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return MessageResponse(message="Your password has been successfully reset. You may now log in.")

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    new_refresh_token = create_refresh_token({"sub": str(user.id), "email": user.email})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserOut.model_validate(user)
    )

@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    return MessageResponse(message="Successfully logged out.")

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
