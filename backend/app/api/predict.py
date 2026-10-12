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
from app.utils.data_parser import parse_raw_bytes_to_df

router = APIRouter()

SUPPORTED_EXTENSIONS = (".csv", ".tsv", ".txt", ".xlsx", ".xls", ".json")

@router.post("/predict", response_model=PipelineResultResponse)
async def predict_failure_risk(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs the full 6-agent AI pipeline on an uploaded dataset file (CSV, TSV, Excel, JSON).
    Orchestrates Validation -> Preprocessing -> RF & XGBoost Prediction ->
    Risk Analysis -> Recommendations -> Debugging Plans.
    """
    fn_lower = file.filename.lower()
    if not any(fn_lower.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{file.filename}'. Supported formats: CSV (.csv), TSV (.tsv), Excel (.xlsx, .xls), JSON (.json), TXT (.txt)."
        )
        
    try:
        contents = await file.read()
        if not contents or len(contents.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset file contains no records or is empty."
            )
        df = parse_raw_bytes_to_df(contents, file.filename)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to parse dataset file: {str(e)}"
        )
        
    if df.empty or len(df) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parsed dataset contains no module records."
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

