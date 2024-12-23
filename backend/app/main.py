from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import todos

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "API is running!"}

# Register the todos routes
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

