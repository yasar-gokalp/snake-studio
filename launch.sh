#!/usr/bin/env bash

# NVM ve Node ortam değişkenleri
export PATH="$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

BASE_DIR="$HOME/projects/snake-studio"

# 1. FastAPI Backend'i sanal ortamın uvicorn ikilisi ile başlat
if ! lsof -i:8000 > /dev/null 2>&1; then
    cd "$BASE_DIR/backend"
    nohup "$BASE_DIR/backend/venv/bin/uvicorn" main:app --host 127.0.0.1 --port 8000 > /tmp/snakestudio_backend.log 2>&1 &
fi

# 2. Frontend dizinine geç
cd "$BASE_DIR/frontend"

# 3. Vite açık değilse başlat ve hazır olmasını bekle
if ! lsof -i:5173 > /dev/null 2>&1; then
    nohup npm run dev > /tmp/snakestudio_vite.log 2>&1 &
    for i in {1..20}; do
        if lsof -i:5173 > /dev/null 2>&1; then
            break
        fi
        sleep 0.5
    done
fi

# 4. Electron'u başlat
./node_modules/.bin/electron electron.cjs --no-sandbox > /tmp/snakestudio_electron.log 2>&1
