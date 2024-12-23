from pydantic import BaseModel
from typing import Optional

class Todo(BaseModel):
    id: Optional[str]  # Firestore assigns this when creating a new todo
    name: str
    dueDate: str
    description: Optional[str] = None
    estimatedTime: Optional[str] = None
    priority: str
