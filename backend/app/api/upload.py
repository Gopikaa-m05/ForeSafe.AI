import io
import os
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.api.auth import get_current_user
from app.db.models import User
from app.schemas.prediction import UploadValidationResponse
from app.ml.train import FEATURE_COLUMNS

router = APIRouter()

@router.post("/upload", response_model=UploadValidationResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV (.csv) files are supported for NASA JM1 risk analysis."
        )
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV file: {str(e)}"
        )
        
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded CSV file is empty."
        )
        
    # Standardize column names
    df.columns = [c.strip() for c in df.columns]
    
    found_cols = [c for c in FEATURE_COLUMNS if c in df.columns]
    missing_cols = [c for c in FEATURE_COLUMNS if c not in df.columns]
    
    is_valid = len(found_cols) >= 10
    schema_status = "Valid NASA JM1 Schema" if len(missing_cols) == 0 else f"Partial Match ({len(found_cols)}/21 features)"
    
    # Save a temporary copy in upload dir
    save_path = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}_{file.filename}")
    with open(save_path, "wb") as f:
        f.write(contents)
        
    # Generate clean sample preview (top 5 rows)
    preview_df = df.head(5).fillna(0)
    sample_preview = preview_df.to_dict(orient="records")
    
    message = (
        f"File '{file.filename}' processed successfully ({len(df)} rows). "
        f"Found {len(found_cols)}/21 Halstead & McCabe metric columns."
    )
    if missing_cols:
        message += f" Note: {len(missing_cols)} optional features will be automatically imputed during preprocessing."
        
    return UploadValidationResponse(
        filename=file.filename,
        row_count=len(df),
        is_valid=is_valid,
        schema_status=schema_status,
        columns_found=found_cols,
        missing_columns=missing_cols,
        sample_preview=sample_preview,
        message=message
    )

@router.get("/sample-dataset")
def download_sample_dataset():
    """Generates and streams a high quality sample NASA JM1 dataset for testing."""
    sample_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/jm1.csv"))
    if os.path.exists(sample_path):
        df = pd.read_csv(sample_path).head(60)
    else:
        # Create a quick sample
        from data.generate_jm1 import fetch_or_generate_jm1
        fetch_or_generate_jm1()
        df = pd.read_csv(sample_path).head(60)
        
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nasa_jm1_sample_dataset.csv"}
    )
