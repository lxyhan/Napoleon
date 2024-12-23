from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from openai import OpenAI
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

client = OpenAI()

def refine_with_gpt(sorted_todos: list, user_context: list) -> list:
    """
    Refine the sorted todos using GPT and generate explanations.

    Args:
        sorted_todos (list): The list of tasks pre-sorted by the backend.
        user_context (list): A list of user-provided short-answer responses.

    Returns:
        list: Refined tasks with explanations for their prioritization.
    """
    # Format the task list as a human-readable input for GPT
    task_descriptions = "\n".join(
        [f"{i + 1}. {todo['name']} (Due: {todo['dueDate']}, Priority: {todo['priority']})"
         for i, todo in enumerate(sorted_todos)]
    )

    # Format user context into readable input
    context_info = "\n".join(user_context)

    # GPT prompt
    prompt = f"""
    You are a productivity assistant. Here is the user's task list, sorted by due date and priority:
    {task_descriptions}

    The user has provided the following context for prioritization:
    {context_info}

    Refine the task order if needed, considering:
    - Deadlines (tasks due sooner should generally come first).
    - Priority (High > Medium > Low).
    - Alignment with the user's goals and focus areas.
    - Balancing effort and workload over the month.

    For each task, explain why it is in its position in the list.
    Provide the refined task order as a JSON array with fields:
    - "name": Task name.
    - "dueDate": Task due date.
    - "priority": Task priority.
    - "reason": Explanation for why the task is prioritized this way.
    """

    try:
        # Use the updated OpenAI client method
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an intelligent productivity assistant."},
                {"role": "user", "content": prompt},
            ]
        )

        # Parse GPT response content
        gpt_output = completion.choices[0].message.content

        # Convert GPT output to Python list (if it’s JSON)
        try:
            refined_tasks = json.loads(gpt_output)
        except json.JSONDecodeError:
            raise Exception("GPT did not return valid JSON.")

        return refined_tasks
    except Exception as e:
        raise Exception(f"GPT refinement failed: {e}")

# GET all todos
@router.get("/")
async def get_todos():
    try:
        # Fetch tasks from Firestore
        todos = []
        docs = todos_collection.stream()
        for doc in docs:
            todo = doc.to_dict()
            todo["id"] = doc.id  # Include the Firestore document ID
            todos.append(todo)
        
        # Step 1: Perform primitive prioritization
        sorted_todos = primitive_prioritization(todos)
        
        # Step 2: Define user context
        user_context = [
            "Primary goal: Complete the product launch by December 31.",
            "Focus areas: Fitness, Career Progression.",
            "Working style: Deadline-oriented and high focus."
        ]

        refined_tasks = refine_with_gpt(sorted_todos, user_context)

        return refined_tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching todos: {str(e)}")


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

        # Debug: Log fetched todos
        print("Fetched todos:", todos)
        
        # Step 1: Perform primitive prioritization
        sorted_todos = primitive_prioritization(todos)
        print("Sorted todos:", sorted_todos)  # Debug

        # Step 2: Define user context
        user_context = [
            "Primary goal: Complete the product launch by December 31.",
            "Focus areas: Fitness, Career Progression.",
            "Working style: Deadline-oriented and high focus."
        ]
        print("User context:", user_context)  # Debug

        # Step 3: Refine with GPT
        refined_tasks = refine_with_gpt(sorted_todos, user_context)
        print("Refined tasks:", refined_tasks)  # Debug

        # Return refined tasks with explanations
        return {"tasks": refined_tasks}
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
