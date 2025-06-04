import os
import datetime
import uuid
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore

_app = None
_db = None


def initialize_firebase(credential_path: Optional[str] = None):
    """Initialize Firebase application and return the Firestore client."""
    global _app, _db

    if _app is not None:
        return _db

    cred_path = (
        credential_path
        or os.environ.get("FIREBASE_CREDENTIALS")
        or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    )

    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        _app = firebase_admin.initialize_app(cred)
    else:
        _app = firebase_admin.initialize_app()

    _db = firestore.client()
    return _db


def _get_db():
    if _db is None:
        initialize_firebase()
    return _db


def log_waste_event(
    bin_id: str,
    waste_type: str,
    raw_image_path: Optional[str] = None,
    user_id: Optional[str] = None,
    is_error: bool = False,
    error_message: Optional[str] = None,
    latency_ms: Optional[int] = None,
    confidence: Optional[float] = None,
) -> None:
    """Record a waste event in Firestore."""
    db = _get_db()
    event_id = str(uuid.uuid4())
    event_data = {
        "event_id": event_id,
        "bin_id": bin_id,
        "timestamp": datetime.datetime.now(),
        "waste_type": waste_type,
        "user_id": user_id,
        "is_error": is_error,
        "error_message": error_message,
        "latency_ms": latency_ms,
        "confidence": confidence,
        "raw_image_path": raw_image_path,
    }
    event_data = {k: v for k, v in event_data.items() if v is not None}
    db.collection("waste_events").document(event_id).set(event_data)


def update_bin_status(bin_id: str, alert_waste_type: Optional[str] = None) -> None:
    """Update bin status including last update timestamp and alerts."""
    db = _get_db()
    bin_ref = db.collection("bins").document(bin_id)
    updates = {"last_update": datetime.datetime.now()}
    if alert_waste_type:
        updates[f"alerts.{alert_waste_type}"] = True
    bin_ref.set(updates, merge=True)


def create_alert(bin_id: str, message: str, alert_type: str) -> None:
    """Create an alert entry in Firestore."""
    db = _get_db()
    alert_data = {
        "bin_id": bin_id,
        "created_at": datetime.datetime.now(),
        "message": message,
        "resolved": False,
        "type": alert_type,
    }
    db.collection("alerts").add(alert_data)

