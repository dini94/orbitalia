"""Safe development gateway skeleton. Job execution is disabled by default."""
from __future__ import annotations
import os, secrets, re
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_DIR = Path(__file__).resolve().parent
TOKEN = os.getenv("CCLAB_API_TOKEN", "")
EXECUTION_ENABLED = os.getenv("CCLAB_EXECUTION_ENABLED", "false").lower() == "true"
JOB_ROOT = Path(os.getenv("CCLAB_JOB_ROOT", str(APP_DIR / "jobs"))).resolve()
ORIGINS = [x.strip() for x in os.getenv("CCLAB_ALLOWED_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000").split(",") if x.strip()]

app = FastAPI(title="Computational Chemistry Lab Gateway", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Authorization", "Content-Type"])

class JobRequest(BaseModel):
    target: Literal["local", "hpc"]
    name: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9][A-Za-z0-9_.-]*$")
    input_text: str = Field(min_length=1, max_length=200_000)
    cores: int = Field(default=4, ge=1, le=32)
    memory_gb: int = Field(default=8, ge=1, le=128)
    partition: str = Field(default="short", pattern=r"^(short|medium-small|medium-large|long|very-long)$")

def authorize(authorization: str | None):
    if not TOKEN or len(TOKEN) < 24:
        raise HTTPException(status_code=503, detail="Gateway token is not configured with a sufficiently long secret.")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Bearer token required.")
    supplied = authorization.removeprefix("Bearer ").strip()
    if not secrets.compare_digest(supplied, TOKEN):
        raise HTTPException(status_code=403, detail="Invalid token.")

@app.get("/health")
def health():
    return {"ok": True, "execution_enabled": EXECUTION_ENABLED, "service": "cclab-gateway"}

@app.get("/api/status")
def status(authorization: str | None = Header(default=None)):
    authorize(authorization)
    return {"connected": True, "execution_enabled": EXECUTION_ENABLED, "targets": {"local": "not_configured", "hpc": "not_configured"}}

@app.post("/api/jobs")
def submit_job(req: JobRequest, authorization: str | None = Header(default=None)):
    authorize(authorization)
    if not EXECUTION_ENABLED:
        raise HTTPException(status_code=503, detail="Execution is disabled. Configure and review an executor before enabling submissions.")
    # Deliberately no shell execution in this skeleton. Implement a site-reviewed
    # executor with subprocess argument lists, strict resource policy, isolation,
    # timeout handling, and audit logs before enabling this endpoint.
    raise HTTPException(status_code=501, detail=f"No executor configured for target '{req.target}'. No job was submitted.")

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, authorization: str | None = Header(default=None)):
    authorize(authorization)
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,80}", job_id):
        raise HTTPException(status_code=400, detail="Invalid job id.")
    raise HTTPException(status_code=404, detail="No job store is configured.")
