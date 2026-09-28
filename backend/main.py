import os
import shlex
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SnakeStudio Secure Local Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunRequest(BaseModel):
    command: str

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.join(BASE_DIR, "bin")

# 3 Çekirdek aracı whitelist'e alıyoruz
ALLOWED_BINARIES = {"bedtools", "samtools", "seqtk"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "bin_dir": BIN_DIR}

@app.post("/api/run")
def run_command(req: RunRequest):
    raw_cmd = req.command.strip()
    if not raw_cmd:
        raise HTTPException(status_code=400, detail="Komut boş olamaz.")

    try:
        tokens = shlex.split(raw_cmd)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Komut ayrıştırma hatası: {str(e)}")

    if not tokens:
        raise HTTPException(status_code=400, detail="Geçersiz komut.")

    binary_name = tokens[0]

    # Beyaz liste kontrolü
    if binary_name not in ALLOWED_BINARIES:
        raise HTTPException(
            status_code=403, 
            detail=f"Güvenlik İhlali: '{binary_name}' komutuna izin verilmiyor."
        )

    # Yerel bin klasöründe varsa onu kullan
    local_binary = os.path.join(BIN_DIR, binary_name)
    if os.path.exists(local_binary) and os.access(local_binary, os.X_OK):
        tokens[0] = local_binary

    try:
        proc = subprocess.run(
            tokens,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120,
            shell=False
        )
        return {
            "status": "success" if proc.returncode == 0 else "error",
            "returncode": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr
        }
    except subprocess.TimeoutExpired:
        return {"status": "error", "returncode": -1, "stdout": "", "stderr": "Zaman aşımı (120s aşıldı)."}
    except Exception as e:
        return {"status": "error", "returncode": -1, "stdout": "", "stderr": str(e)}