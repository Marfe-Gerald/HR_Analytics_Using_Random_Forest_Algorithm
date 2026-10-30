import joblib
import pandas as pd
from typing import Literal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Exported from Colab with joblib.dump(model_good, "hr_attrition_pipeline.joblib")
pipeline = joblib.load("hr_attrition_pipeline.joblib")

# Must match the training columns and their order exactly
FEATURES = [
    "satisfaction_level", "last_evaluation", "number_project",
    "average_monthly_hours", "time_spend_company", "Work_accident",
    "promotion_last_5years", "salary",
]
SALARY_MAP = {"low": 0, "medium": 1, "high": 2}  # same order as the notebook's OrdinalEncoder


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your website's address before going live
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
def predict(emp: Employee):
    row = emp.model_dump()
    row["salary"] = SALARY_MAP[row["salary"]]
    X = pd.DataFrame([row])[FEATURES]
    prob_left = float(pipeline.predict_proba(X)[0, 1])
    return {"will_leave": prob_left >= 0.5, "probability_left": round(prob_left, 3)}
