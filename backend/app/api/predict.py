import io
import pandas as pd
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.auth import get_current_user
from app.db.models import User
from app.agents.orchestrator import pipeline_orchestrator
from app.schemas.prediction import PipelineResultResponse

router = APIRouter()

@router.post("/predict", response_model=PipelineResultResponse)
async def predict_failure_risk(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs the full 6-agent AI pipeline on an uploaded CSV file.
    Orchestrates Validation -> Preprocessing -> RF & XGBoost Prediction ->
    Risk Analysis -> Recommendations -> Debugging Plans.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are accepted."
        )
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to parse CSV file: {str(e)}"
        )
        
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file contains no records."
        )
        
    try:
        result = pipeline_orchestrator.run_pipeline(
            raw_df=df,
            filename=file.filename,
            user_id=current_user.id,
            db=db
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline encountered an error: {str(e)}"
        )
