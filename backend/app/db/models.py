import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    auth_provider = Column(String(50), default="local")    # 'local' or 'google'
    is_verified = Column(Boolean, default=False)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    datasets = relationship("Dataset", back_populates="user", cascade="all, delete-orphan")
    analysis_history = relationship("AnalysisHistory", back_populates="user", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    upload_path = Column(String(512), nullable=False)
    row_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    validation_status = Column(String(50), default="Pending")  # 'Valid', 'Invalid', 'Warning'

    # Relationships
    user = relationship("User", back_populates="datasets")
    predictions = relationship("PredictionResult", back_populates="dataset", cascade="all, delete-orphan")
    history_entries = relationship("AnalysisHistory", back_populates="dataset", cascade="all, delete-orphan")

class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    module_name = Column(String(255), nullable=False, default="Module")
    rf_probability = Column(Float, nullable=False)
    xgb_probability = Column(Float, nullable=False)
    final_risk_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # 'Low', 'Medium', 'High', 'Critical'
    metrics_json = Column(JSON, nullable=True)       # Halstead/McCabe metrics and SHAP explainability
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    dataset = relationship("Dataset", back_populates="predictions")
    risk_reports = relationship("RiskReport", back_populates="prediction_result", cascade="all, delete-orphan")

class RiskReport(Base):
    __tablename__ = "risk_reports"

    id = Column(Integer, primary_key=True, index=True)
    prediction_result_id = Column(Integer, ForeignKey("prediction_results.id", ondelete="CASCADE"), nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=True)
    pdf_path = Column(String(512), nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    prediction_result = relationship("PredictionResult", back_populates="risk_reports")

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    summary_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analysis_history")
    dataset = relationship("Dataset", back_populates="history_entries")
