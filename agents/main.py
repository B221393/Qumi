import os
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from soul_delegation_agent import run_soul_agent

app = FastAPI(title="Qumi Integrated OS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SoulInput(BaseModel):
    thought: str

@app.get("/")
async def root():
    return {"status": "online", "system": "Qumi Integrated OS"}

@app.post("/delegate")
async def delegate_thought(item: SoulInput):
    try:
        result = await run_soul_agent(item.thought)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def proxy_chat(request: Request):
    METACLAW_URL = "http://127.0.0.1:30000/v1/chat/completions"
    body = await request.json()
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(METACLAW_URL, json=body, timeout=60.0)
            return response.json()
        except Exception as e:
            return {"error": "MetaClaw proxy unreachable", "details": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
