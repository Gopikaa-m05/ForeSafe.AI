import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ForeSafe AI — Autonomous Software Failure Prediction & Risk Intelligence"
    API_V1_STR: str = "/api"
    
    # Security / JWT
    SECRET_KEY: str = "super-secret-production-key-change-in-env-9f8a7b6c5d4e3f2a1"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Short-lived access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # Long-lived refresh token
    ALGORITHM: str = "HS256"
    
    # Database (SQLite default for zero-config local run, PostgreSQL supported via DATABASE_URL)
    DATABASE_URL: str = "sqlite:///./software_failure.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = "mock-google-client-id-for-development.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "mock-google-client-secret"
    
    # Email / SMTP Settings
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@foresave.ai"
    EMAILS_FROM_NAME: str = "ForeSafe AI System"
    
    # Frontend URL for password reset links
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Groq LLM API Settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    
    # Uploads & Model Artifacts
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
    MODEL_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ml/model_registry"))
    REPORT_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../reports_generated"))

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.REPORT_DIR, exist_ok=True)
