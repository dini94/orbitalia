"""Local-agent placeholder. It intentionally does not execute Docker jobs."""
from fastapi import FastAPI, Header, HTTPException
import os, secrets

TOKEN = os.getenv("CCLAB_LOCAL_TOKEN", "")
app = FastAPI(title="CCLab Local Agent", version="0.1.0")

def check_token(authorization: str | None):
    if not TOKEN or len(TOKEN) < 24:
        raise HTTPException(status_code=503, detail="Set CCLAB_LOCAL_TOKEN to a long random secret.")
    if not authorization or not authorization.startswith("Bearer ") or not secrets.compare_digest(authorization[7:].strip(), TOKEN):
        raise HTTPException(status_code=401, detail="Valid bearer token required.")

@app.get("/health")
def health():
    return {"ok": True, "execution_enabled": False}

@app.post("/api/jobs")
def submit(authorization: str | None = Header(default=None)):
    check_token(authorization)
    raise HTTPException(status_code=501, detail="Local Docker execution is not implemented. No job was submitted.")
