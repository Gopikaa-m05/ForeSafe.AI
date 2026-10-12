import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api import auth, upload, predict, reports, history, chat, recommendations
from app.ml.predict import model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("software_failure.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables exist
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Seed default user credentials
    from app.db.init_db import init_default_users
    init_default_users()
    
    # Preload and verify ML models
    logger.info("Checking Machine Learning models...")
    try:
        model_manager.load_models()
        logger.info("ML Models (Random Forest & XGBoost) loaded successfully.")
    except Exception as e:
        logger.warning(f"ML models could not be immediately loaded: {e}. Will initialize on first prediction.")
        
    yield
    logger.info("Application shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="ForeSafe AI: Production-grade Autonomous Multi-Agent Software Failure Prediction and Risk Intelligence System trained on NASA PROMISE JM1 dataset.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Include API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(upload.router, prefix=settings.API_V1_STR, tags=["Upload"])
app.include_router(predict.router, prefix=settings.API_V1_STR, tags=["Prediction Pipeline"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["Reports"])
app.include_router(history.router, prefix=settings.API_V1_STR, tags=["History"])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=["AI Copilot Chat"])
app.include_router(recommendations.router, prefix=settings.API_V1_STR, tags=["AI Recommendations"])

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "models_ready": model_manager.rf_model is not None and model_manager.xgb_model is not None
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "ForeSafe AI: Software Failure Prediction & Risk Intelligence API",
        "docs_url": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
