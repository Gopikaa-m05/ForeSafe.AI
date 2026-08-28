from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.api.auth import get_current_user
from app.db.models import User, AnalysisHistory, Dataset
from app.schemas.prediction import HistoryItemOut, MessageResponse

router = APIRouter()

@router.get("/history")
def get_prediction_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    risk_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AnalysisHistory).filter(AnalysisHistory.user_id == current_user.id)
    
    # Sort latest first
    query = query.order_by(desc(AnalysisHistory.created_at))
    all_records = query.all()
    
    # Filter in-memory by filename or risk levels
    filtered = []
    for r in all_records:
        summary = r.summary_json
        filename = summary.get("filename", "")
        if search and search.lower() not in filename.lower():
            continue
            
        dist = summary.get("risk_distribution", {})
        if risk_filter:
            risk_f = risk_filter.lower()
            if risk_f == "critical" and dist.get("critical", 0) == 0:
                continue
            elif risk_f == "high" and (dist.get("high", 0) == 0 and dist.get("critical", 0) == 0):
                continue
            elif risk_f == "medium" and dist.get("medium", 0) == 0:
                continue
            elif risk_f == "low" and dist.get("low", 0) == 0:
                continue
                
        filtered.append({
            "id": r.id,
            "dataset_id": r.dataset_id,
            "filename": filename,
            "total_modules": summary.get("total_modules", 0),
            "risk_distribution": dist,
            "selected_primary_model": summary.get("model_comparison", {}).get("selected_primary_model", "XGBoost Classifier"),
            "created_at": r.created_at,
            "has_pdf_report": True
        })
        
    total_count = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = filtered[start_idx:end_idx]
    
    return {
        "items": paginated_items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1
    }

@router.get("/history/{history_id}")
def get_history_detail(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == history_id,
        AnalysisHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History analysis record not found."
        )
        
    result_json = record.summary_json.copy()
    result_json["history_id"] = record.id
    result_json["created_at"] = record.created_at
    return result_json

@router.delete("/history/{history_id}", response_model=MessageResponse)
def delete_history_record(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == history_id,
        AnalysisHistory.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found."
        )
        
    # Delete associated dataset if exists
    if record.dataset_id:
        ds = db.query(Dataset).filter(Dataset.id == record.dataset_id).first()
        if ds:
            db.delete(ds)
            
    db.delete(record)
    db.commit()
    
    return MessageResponse(message="Analysis record successfully deleted.")
