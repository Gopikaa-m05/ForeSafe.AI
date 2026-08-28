import os
import firebase_admin
from firebase_admin import credentials, firestore

# Locate service account JSON in current directory, parent directory, or main project root
SERVICE_ACCOUNT_LOCATIONS = [
    "firebase_service_account.json",
    os.path.join(os.path.dirname(__file__), "firebase_service_account.json"),
    os.path.join(os.path.dirname(__file__), "..", "firebase_service_account.json"),
]

service_account_path = None
for path in SERVICE_ACCOUNT_LOCATIONS:
    if os.path.exists(path):
        service_account_path = os.path.abspath(path)
        break

if not service_account_path:
    service_account_path = "firebase_service_account.json"

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Warning: Could not initialize Firebase Admin from {service_account_path}: {e}")

try:
    db = firestore.client()
except Exception as e:
    db = None
    print(f"Warning: Could not create Firestore client: {e}")
