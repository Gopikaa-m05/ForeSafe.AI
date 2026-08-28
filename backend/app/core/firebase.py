import os
import logging
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore, auth

logger = logging.getLogger("software_failure.firebase_admin")

# Path to the service account JSON in main project folder or backend
SERVICE_ACCOUNT_PATHS = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../firebase_service_account.json")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../firebase_service_account.json")),
]

_firestore_client = None

def get_firebase_app() -> Optional[firebase_admin.App]:
    """
    Initialize Firebase Admin SDK with the service account credentials if available.
    """
    if firebase_admin._apps:
        return firebase_admin.get_app()

    for path in SERVICE_ACCOUNT_PATHS:
        if os.path.exists(path):
            try:
                cred = credentials.Certificate(path)
                app = firebase_admin.initialize_app(cred)
                logger.info(f"Firebase Admin SDK initialized successfully with credentials: {path}")
                return app
            except Exception as e:
                logger.warning(f"Failed to initialize Firebase Admin from {path}: {e}")

    logger.info("No valid Firebase service account JSON found. Server-side Firebase admin disabled.")
    return None

def get_firestore_db():
    """
    Get the Firestore client instance.
    """
    global _firestore_client
    if _firestore_client is None:
        app = get_firebase_app()
        if app:
            try:
                _firestore_client = firestore.client()
            except Exception as e:
                logger.warning(f"Could not create Firestore client: {e}")
    return _firestore_client
