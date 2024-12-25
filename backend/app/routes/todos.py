from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
import json
from app.config import db
from app.models import Todo

router = APIRouter()
load_dotenv()

# Reference to the Firestore "todos" collection
todos_collection = db.collection("todos")


def primitive_prioritization(todos: list) -> list:
    """
    Prioritize todos: sort by due date first, then by priority within the same due date.
    """
    from datetime import datetime

    # Priority mapping
    priority_map = {"High": 3, "Medium": 2, "Low": 1}

    # Sort by due date first, then by priority (High > Medium > Low)
    todos.sort(
        key=lambda t: (
            datetime.strptime(t["dueDate"], "%Y-%m-%d"),  # Sort by due date (earliest first)
            -priority_map.get(t["priority"], 0),          # Then by priority (descending)
        )
    )
    return todos

@router.get("/")
async def get_todos():
    try:
        # Debug: Log that the function is being called
        print("Fetching todos from Firestore...")

        # Fetch tasks from Firestore
        todos = []
        docs = todos_collection.stream()
        for doc in docs:
            todo = doc.to_dict()
            todo["id"] = doc.id  # Include the Firestore document ID
            todos.append(todo)

        sorted_todos = primitive_prioritization(todos)

        # # Step 2: Define user context
        # user_context = [
        #     "Primary goal: Complete the product launch by December 31.",
        #     "Focus areas: Fitness, Career Progression.",
        #     "Working style: Deadline-oriented and high focus."
        # ]
        # print("User context:", user_context)  # Debug

        # # Step 3: Refine with GPT
        # refined_tasks = refine_with_gpt(sorted_todos, user_context)
        # print("Refined tasks:", refined_tasks)  # Debug

        # Return refined tasks with explanations
        return sorted_todos
    except Exception as e:
        # Log the error
        print("Error fetching todos:", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching todos: {str(e)}")


# POST a new todo
@router.post("/", status_code=201)
async def create_todo(todo: Todo):
    try:
        todo_dict = todo.dict(exclude_unset=True)
        doc_ref = todos_collection.add(todo_dict)
        todo_dict["id"] = doc_ref[1].id  # Add the Firestore document ID
        return todo_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding todo: {str(e)}")


# DELETE a todo
@router.delete("/{todo_id}")
async def delete_todo(todo_id: str):
    try:
        doc_ref = todos_collection.document(todo_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Todo not found")
        doc_ref.delete()
        return {"message": "Todo deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting todo: {str(e)}")
