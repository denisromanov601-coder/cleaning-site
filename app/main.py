from datetime import datetime
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routers.users.user_router import router as users_router
from app.routers.schedule.schedule_router import router as schedule_router
from app.database import engine, Base
from app.routers.schedule.schedule_router import router as schedule_router
from app.routers.tasks.task_router import router as task_router
from app.routers.housing.housing_router import router as housing_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="🧹 Cleaning API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router, prefix="/api/v1", tags=["users"])
app.include_router(schedule_router, prefix="/api/v1", tags=["schedules"])
app.include_router(task_router, prefix="/api/v1", tags=["tasks"])
app.include_router(housing_router, prefix="/api/v1", tags=["housing"])


@app.get("/")
async def root():
    return {"message": "✅ Backend готов! /docs → Swagger"}


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str, type_: str = "info"):
        payload = json.dumps(
            {
                "type": type_,
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        for connection in self.active_connections:
            await connection.send_text(payload)


manager = ConnectionManager()


@app.websocket("/api/v1/users/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket)
    try:
        await manager.broadcast(f"Пользователь {user_id} подключился", "success")
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"🧹 {user_id}: {data}", "info")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Пользователь {user_id} отключился", "warning")



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://cleaning-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
