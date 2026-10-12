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
from app.utils.data_parser import parse_dataset_file

router = APIRouter()

SUPPORTED_EXTENSIONS = (".csv", ".tsv", ".txt", ".xlsx", ".xls", ".json")

@router.post("/upload", response_model=UploadValidationResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    fn_lower = file.filename.lower()
    if not any(fn_lower.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file.filename}'. Supported formats: CSV (.csv), TSV (.tsv), Excel (.xlsx, .xls), JSON (.json), TXT (.txt)."
        )
        
    try:
        contents = await file.read()
        if not contents or len(contents.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty."
            )
            
        clean_df, module_names, meta = parse_dataset_file(contents, file.filename)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse file '{file.filename}': {str(e)}"
        )
        
    if clean_df.empty or len(clean_df) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file contains no data rows."
        )
        
    found_cols = meta["found_features"]
    missing_cols = [c for c in FEATURE_COLUMNS if c not in found_cols]
    
    # Dataset is considered valid for AI analysis as long as records were parsed and structured
    is_valid = len(clean_df) > 0
    
    if len(found_cols) == len(FEATURE_COLUMNS):
        schema_status = "Valid NASA JM1 Full Schema (21/21 features)"
    elif len(found_cols) >= 10:
        schema_status = f"Valid NASA JM1 Schema ({len(found_cols)}/21 features matched)"
    else:
        schema_status = f"Smart-Mapped & Synthesized ({len(found_cols)}/21 detected, {len(missing_cols)} auto-synthesized)"
    
    # Save a temporary copy in upload dir
    try:
        save_path = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}_{file.filename}")
        with open(save_path, "wb") as f:
            f.write(contents)
    except Exception as err:
        pass
        
    # Generate clean sample preview (top 5 rows) with module name
    preview_df = clean_df.head(5).copy()
    preview_df.insert(0, "module", module_names[:5])
    sample_preview = preview_df.to_dict(orient="records")
    
    message = (
        f"File '{file.filename}' parsed successfully ({len(clean_df)} software modules). "
        f"Detected {len(found_cols)}/21 Halstead & McCabe metric columns."
    )
    if missing_cols:
        message += f" {len(missing_cols)} complementary metrics will be automatically synthesized and imputed during pipeline execution."
        
    return UploadValidationResponse(
        filename=file.filename,
        row_count=len(clean_df),
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

