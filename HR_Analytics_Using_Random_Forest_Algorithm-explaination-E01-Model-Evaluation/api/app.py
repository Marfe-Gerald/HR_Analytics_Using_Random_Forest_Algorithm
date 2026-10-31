import json
import os
import re
from typing import Literal, Optional

import firebase_admin
import joblib
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore
from pydantic import BaseModel, Field

load_dotenv()  # reads api/.env when running locally; on Render the real env vars are used

# Exported from Colab with joblib.dump(model_good, "hr_attrition_pipeline.joblib")
pipeline = joblib.load("hr_attrition_pipeline.joblib")

# Must match the training columns and their order exactly
FEATURES = [
    "satisfaction_level", "last_evaluation", "number_project",
    "average_monthly_hours", "time_spend_company", "Work_accident",
    "promotion_last_5years", "salary",
]
SALARY_MAP = {"low": 0, "medium": 1, "high": 2}  # same order as the notebook's OrdinalEncoder


# ---------------------------------------------------------------- Firestore
def init_firestore():
    """Connects to Firestore using a service account key that only the server can see.
    Option 1 (Render): FIREBASE_CREDENTIALS_JSON = the full contents of the key file.
    Option 2 (local or Render Secret File): FIREBASE_CREDENTIALS_PATH = path to the key file.
    If neither is set, history is switched off and /predict still works."""
    raw = os.getenv("FIREBASE_CREDENTIALS_JSON")
    path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if raw:
        cred = credentials.Certificate(json.loads(raw))
    elif path and os.path.exists(path):
        cred = credentials.Certificate(path)
    else:
        print("WARNING: no Firebase credentials found. History is disabled.")
        return None
    firebase_admin.initialize_app(cred)
    return firestore.client()


db = init_firestore()
UUID_RE = re.compile(r"^[0-9a-fA-F-]{36}$")


def clean_visitor_id(value: Optional[str]) -> Optional[str]:
    return value if value and UUID_RE.match(value) else None


def history_ref(visitor_id: str):
    # visitors/{visitor_id}/predictions/{auto id}
    return db.collection("visitors").document(visitor_id).collection("predictions")


# ---------------------------------------------------------------- API
class Employee(BaseModel):
    satisfaction_level: float = Field(ge=0, le=1)
    last_evaluation: float = Field(ge=0, le=1)
    number_project: int
    average_monthly_hours: int
    time_spend_company: int
    Work_accident: Literal[0, 1]
    promotion_last_5years: Literal[0, 1]
    salary: Literal["low", "medium", "high"]


app = FastAPI()

# ALLOWED_ORIGINS is a comma-separated list, e.g. "https://my-site.onrender.com,http://127.0.0.1:5500".
# No cookies are sent to this API (the visitor id travels in a header), so credentials are not needed.
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "history_enabled": db is not None}


@app.post("/predict")
def predict(emp: Employee, x_visitor_id: Optional[str] = Header(default=None)):
    row = emp.model_dump()
    original = dict(row)
    row["salary"] = SALARY_MAP[row["salary"]]
    X = pd.DataFrame([row])[FEATURES]
    prob_left = float(pipeline.predict_proba(X)[0, 1])
    result = {"will_leave": prob_left >= 0.5, "probability_left": round(prob_left, 3)}

    visitor_id = clean_visitor_id(x_visitor_id)
    if db is not None and visitor_id:
        try:
            history_ref(visitor_id).add({
                "input": original,
                "result": result,
                "created_at": firestore.SERVER_TIMESTAMP,
            })
        except Exception as e:  # never let a database problem break the prediction
            print("Could not save history:", e)
    return result


@app.get("/history")
def get_history(x_visitor_id: Optional[str] = Header(default=None)):
    visitor_id = clean_visitor_id(x_visitor_id)
    if db is None:
        raise HTTPException(503, "History is not configured on the server.")
    if not visitor_id:
        raise HTTPException(400, "Missing or invalid X-Visitor-Id header.")
    docs = (history_ref(visitor_id)
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(50).stream())
    items = []
    for d in docs:
        data = d.to_dict()
        ts = data.get("created_at")
        items.append({
            "id": d.id,
            "input": data.get("input", {}),
            "result": data.get("result", {}),
            "created_at": ts.isoformat() if ts else None,
        })
    return {"items": items}


@app.delete("/history")
def clear_history(x_visitor_id: Optional[str] = Header(default=None)):
    visitor_id = clean_visitor_id(x_visitor_id)
    if db is None:
        raise HTTPException(503, "History is not configured on the server.")
    if not visitor_id:
        raise HTTPException(400, "Missing or invalid X-Visitor-Id header.")
    deleted = 0
    for d in history_ref(visitor_id).limit(500).stream():
        d.reference.delete()
        deleted += 1
    return {"deleted": deleted}
