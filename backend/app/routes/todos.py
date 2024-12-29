from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
import json
from app.config import db
from app.models import Todo
from openai import OpenAI
from gcal_utils import get_busy_times, create_gcal_event, delete_gcal_event, list_calendars
from datetime import datetime, timedelta
import pytz  

router = APIRouter()
load_dotenv()

client = OpenAI()

def get_local_time():
    # Replace "America/New_York" with your desired timezone
    local_tz = pytz.timezone("America/New_York")
    return datetime.now(local_tz).strftime("%Y-%m-%d")

def primitive_prioritization(todos: list) -> list:
    """
    Prioritize todos: sort by due date first, then by priority within the same due date.
    """
    priority_map = {"High": 3, "Medium": 2, "Low": 1}
    todos.sort(
        key=lambda t: (
            datetime.strptime(t["dueDate"], "%Y-%m-%d"),  # Sort by due date
            -priority_map.get(t["priority"], 0),          # Then by priority
        )
    )
    return todos
# Reference to the Firestore "todos" collection
todos_collection = db.collection("todos")

def fetch_user_profile():
    """
    Fetch the user's profile from the Firestore 'profiles' collection.

    Returns:
        dict: User profile data (e.g., name, goals, etc.).
    """
    try:
        # Fetch the profile document (assuming a single user for now)
        profile_ref = db.collection("profiles").document("1FPowLLVNTchufO5ZF5o")  # Replace with actual user ID
        profile_data = profile_ref.get().to_dict()

        if not profile_data:
            raise Exception("Profile not found in Firestore.")

        return {
            "name": profile_data.get("username", "User"),
            "about": profile_data.get("about", ""),
            "short_term_goals": profile_data.get("short_term_goals", []),
            "medium_term_goals": profile_data.get("medium_term_goals", []),
            "long_term_goals": profile_data.get("long_term_goals", []),
        }
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return {}


def schedule_tasks():
    """
    Central function to reschedule all tasks using GPT for intelligent scheduling.
    Fetches tasks, busy times, and free times, and delegates scheduling to GPT.
    """
    try:
        # Step 1: Fetch all tasks from Firestore
        todos = []
        docs = todos_collection.stream()
        for doc in docs:
            todo = doc.to_dict()
            todo["id"] = doc.id  # Include Firestore document ID
            todos.append(todo)

        # Step 2: Prioritize tasks
        prioritized_tasks = primitive_prioritization(todos)

        # Step 3: Remove old Google Calendar events
        for task in prioritized_tasks:
            if "gcalEventId" in task:
                try:
                    delete_gcal_event(task["gcalEventId"])  # Delete task's Google Calendar event
                    print(f"Deleted Google Calendar event for task: {task['id']}")
                except Exception as e:
                    print(f"Failed to delete event for task {task['id']}: {e}")

        # Step 4: Fetch existing Google Calendar events (busy times)
        now = datetime.now(pytz.timezone("America/New_York"))
        end_time = now + timedelta(days=15)  # Schedule tasks for the next 7 days
        busy_times = get_busy_times(now, end_time)  # Busy periods from Google Calendar

        # Convert busy times to timezone-aware datetime objects
        busy_times = [
            {
                "start": datetime.fromisoformat(busy["start"]).astimezone(pytz.timezone("America/New_York")),
                "end": datetime.fromisoformat(busy["end"]).astimezone(pytz.timezone("America/New_York")),
            }
            for busy in busy_times
        ]

        # Step 5: Fetch user profile for context
        user_profile = fetch_user_profile()

        # Step 6: Prepare input for GPT
        gpt_input = prepare_gpt_input(prioritized_tasks, busy_times, now, end_time, user_profile)

        # Step 7: Call GPT for scheduling
        gpt_output = call_gpt_for_scheduling(gpt_input)

        # Step 8: Apply GPT's output to Firestore and Google Calendar
        apply_schedule(gpt_output)

        # Step 9: Print GPT Message for Tasks Due Today
        print(gpt_output.get("today", "No message returned from GPT."))
        print(gpt_output.get("reasoning", "No message returned from GPT."))


    except Exception as e:
        print(f"Error in scheduling tasks: {e}")
        raise HTTPException(status_code=500, detail=f"Error in scheduling tasks: {str(e)}")


def prepare_gpt_input(prioritized_tasks, busy_times, start_time, end_time, user_profile):
    """
    Prepares input data for GPT to schedule tasks.

    Args:
        prioritized_tasks (list): List of tasks sorted by priority.
        busy_times (list): List of busy time slots from Google Calendar.
        start_time (datetime): Start time for scheduling.
        end_time (datetime): End time for scheduling.
        user_profile (dict): User profile data (e.g., goals, preferences).

    Returns:
        dict: Input data for GPT.
    """
    # Adjust `start_time` to the next whole 30-minute mark
    if start_time.minute > 0:
        start_time = start_time.replace(minute=(start_time.minute // 30 + 1) * 30 % 60, second=0, microsecond=0)
        if start_time.minute == 0:  # Handle overflow to the next hour
            start_time += timedelta(hours=1)

    # Define free times based on busy times
    free_times = []
    current_time = start_time

    for busy in busy_times:
        busy_start = busy["start"]
        busy_end = busy["end"]

        if current_time < busy_start:
            free_times.append({
                "start": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "end": busy_start.strftime("%Y-%m-%d %H:%M:%S")
            })

        current_time = max(current_time, busy_end)

    if current_time < end_time:
        free_times.append({
            "start": current_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end": end_time.strftime("%Y-%m-%d %H:%M:%S")
        })

    # Format busy times to exclude unnecessary precision
    formatted_busy_times = [
        {
            "start": busy["start"].strftime("%Y-%m-%d %H:%M:%S"),
            "end": busy["end"].strftime("%Y-%m-%d %H:%M:%S")
        }
        for busy in busy_times
    ]

    # Format tasks for explicit dates and remove unnecessary precision
    formatted_tasks = [
        {
            "id": task["id"],
            "name": task["name"],
            "description": task["description"],
            "priority": task["priority"],
            "due_date": datetime.fromisoformat(task["dueDate"]).strftime("%Y-%m-%d %H:%M:%S"),
            "scheduled_date": task.get("scheduledDate"),
            "estimated_time_hours": task["estimatedTime"],
            "gcal_event_id": task.get("gcalEventId")
        }
        for task in prioritized_tasks
    ]

    # Prepare context for GPT
    gpt_input = {
        "tasks": formatted_tasks,  # Task list with formatted details
        "busy_times": formatted_busy_times,
        "free_times": free_times,
        "context": {
            "timezone": "America/New_York",
            "start_date": start_time.strftime("%Y-%m-%d"),
            "end_date": end_time.strftime("%Y-%m-%d"),
            "user_profile": user_profile,  # Include user profile here
        },
    }

    return gpt_input

def call_gpt_for_scheduling(gpt_input):
    """
    Calls GPT API to intelligently schedule tasks.

    Args:
        gpt_input (dict): Input data for GPT.

    Returns:
        dict: Scheduled tasks with their assigned time slots and a message.
    """
    try:
        # Define the GPT prompt
        prompt = f"""
        You are a smart AI assistant who is asked to provide a human like scheduling experience for a high achieving and motivated student based on the following.

        **Guiding Principles for Scheduling:**

        1. **Focus on Filling Each Day First**:
        The main goal is to create a reasonable schedule that makes the best use of each day’s available time. Start by filling today’s free time with tasks in a logical order, leaving enough room for breaks and transitions. Once the day is reasonably full, move on to the next day. Avoid spreading tasks across multiple days unless necessary due to deadlines or task size.

        2. **Prioritize Context Over Strict Rules**:
        Use common sense and consider the user’s context. Respect deadlines and task priorities, but also think about what feels natural and manageable for the user. If today has available time, prioritize completing tasks now rather than deferring them unnecessarily.

        3. **Be Practical and Realistic**:
        Avoid scheduling tasks at night or during times that would feel unnatural for the user (e.g., late-night hours). Think about what a reasonable and productive schedule would look like for a student. If there are longer tasks, use your judgment to split them or defer them without overloading a single day.

        4. **Create a Productive Flow**:
        Try to group related tasks or balance the workload across days in a way that feels manageable. Don’t overload one day if it leaves others completely empty. At the same time, don’t leave large gaps of unused time unless it makes sense for the user.

        5. **Explain Your Reasoning**:
        Always explain why tasks were scheduled in a particular way. If a task couldn’t be scheduled, provide a clear and specific reason. Show how your scheduling decisions align with the user’s goals and preferences.

        
        **How to Handle Free Time:**
        - Treat free time as individual daily blocks. For example, if free time spans multiple days, schedule tasks day-by-day starting from the earliest available slot.
        - Use earlier days first and only move to later days if necessary.

        **Debugging Requirements:**
        Provide a reasoning section explaining:
        - Why each task was scheduled at its specific time.
        - Why earlier free time slots were not used (if applicable).

        **Important Context:**
        - **Start and End Dates:** {gpt_input['context']['start_date']} to {gpt_input['context']['end_date']} represent the range in which tasks can be scheduled.
        - **Free Time:** Use the provided free time blocks. Do not overlap with busy times.

        **User Profile:**
        Name: {gpt_input['context']['user_profile']['name']}
        About: {gpt_input['context']['user_profile']['about']}
        Short-term Goals: {gpt_input['context']['user_profile']['short_term_goals']}
        Medium-term Goals: {gpt_input['context']['user_profile']['medium_term_goals']}
        Long-term Goals: {gpt_input['context']['user_profile']['long_term_goals']}

        **Tasks:**
        {json.dumps(gpt_input['tasks'], indent=2)}

        **Free Times:**
        {json.dumps(gpt_input['free_times'], indent=2)}

        **Busy Times:**
        {json.dumps(gpt_input['busy_times'], indent=2)}

        **Expected Output:**
        Strictly return a JSON object with the following structure:
        {{
            "scheduled_tasks": [
                {{
                    "task_id": "string",
                    "start_time": "ISO 8601 datetime",
                    "end_time": "ISO 8601 datetime"
                }}
            ],
            "reasoning": "string",
            "today": "string"
        }}

        Be logical and concise in your scheduling. Ensure tasks fit the user's context and goals, and distribute them sensibly.

        In the "today" section, write a motivational message for the user based on the tasks scheduled for today. Focus on encouraging them and showing how their work contributes to their goals.
        """
        print(prompt)
        
        # Call GPT API
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a logical scheduling assistant. Follow the user's instructions to create an efficient schedule."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=3000,
        )

        # Parse GPT response
        gpt_raw_response = completion.choices[0].message.content.strip()
        print(f"Raw GPT Response: {gpt_raw_response}")

        # Remove triple backticks if they exist
        if gpt_raw_response.startswith("```"):
            gpt_raw_response = gpt_raw_response.strip("```").strip("json").strip()

        if not gpt_raw_response:
            raise Exception("GPT returned an empty response")

        gpt_output = json.loads(gpt_raw_response)  # Parse JSON
        return gpt_output

    except Exception as e:
        print(f"Error calling GPT for scheduling: {e}")
        raise HTTPException(status_code=500, detail="Failed to call GPT for scheduling.")


def apply_schedule(gpt_output):
    """
    Applies GPT's schedule to Google Calendar and Firestore.

    Args:
        gpt_output (dict): GPT output containing scheduled tasks and summary.
    """
    try:
        # Extract scheduled tasks from the GPT output
        scheduled_tasks = gpt_output.get("scheduled_tasks", [])

        # Process each scheduled task
        for task in scheduled_tasks:
            # Parse task details
            task_id = task["task_id"]
            start_time = datetime.fromisoformat(task["start_time"])
            end_time = datetime.fromisoformat(task["end_time"])

            # Fetch task details from Firestore
            doc_ref = todos_collection.document(task_id)
            task_data = doc_ref.get().to_dict()
            if not task_data:
                print(f"Task not found in Firestore: {task_id}")
                continue

            # Create event in Google Calendar
            event = create_gcal_event(task_data, start_time, end_time)
            if not event:
                print(f"Failed to create event for task: {task_id}")
                continue

            # Update Firestore with the scheduled info
            task_data["scheduledDate"] = start_time.date().isoformat()
            task_data["timeSlot"] = f"{start_time.time()} - {end_time.time()}"
            task_data["gcalEventId"] = event.get("id")
            doc_ref.update(task_data)

    except Exception as e:
        print(f"Error applying schedule: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply schedule.")

@router.post("/reschedule")
async def reschedule_tasks():
    """
    Endpoint to reschedule tasks by calling the existing scheduling method.
    """
    try:
        # Call the existing scheduling logic
        result = schedule_tasks()

        return {"message": "Tasks successfully rescheduled", "result": result}
    except Exception as e:
        print(f"Error rescheduling tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to reschedule tasks")

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
        return sorted_todos
    except Exception as e:
        # Log the error
        print("Error fetching todos:", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching todos: {str(e)}")


@router.post("/", status_code=201)
async def create_todo(todo: Todo):
    """
    Create a new task and trigger scheduling.
    """
    try:
        # Add the new task to Firestore
        todo_dict = todo.dict(exclude_unset=True)
        doc_ref = todos_collection.add(todo_dict)
        todo_dict["id"] = doc_ref[1].id

        return todo_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding todo: {str(e)}")

@router.put("/{todo_id}")
async def update_todo(todo_id: str, todo: Todo):
    """
    Update an existing task and trigger scheduling.
    """
    try:
        # Update the task in Firestore
        todo_dict = todo.dict(exclude_unset=True)
        todos_collection.document(todo_id).update(todo_dict)

        return {"message": "Todo updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating todo: {str(e)}")

@router.delete("/{todo_id}")
async def delete_todo(todo_id: str):
    """
    Delete a task and trigger rescheduling.
    """
    try:
        # Step 1: Fetch the task to get `gcalEventId` before deleting from Firestore
        doc_ref = todos_collection.document(todo_id)
        todo_data = doc_ref.get().to_dict()
        if not todo_data:
            raise HTTPException(status_code=404, detail="Todo not found")

        gcal_event_id = todo_data.get("gcalEventId")  # Get the associated Google Calendar event ID
        print(f"Task to delete: {todo_data}")  # Debug log

        # Step 2: Delete the associated Google Calendar event
        if gcal_event_id:
            try:
                delete_gcal_event(gcal_event_id)  # Call the function to delete the event from Google Calendar
                print(f"Deleted Google Calendar event: {gcal_event_id}")
            except Exception as e:
                print(f"Error deleting Google Calendar event: {e}")

        # Step 3: Delete the task from Firestore
        doc_ref.delete()
        print(f"Task deleted from Firestore: {todo_id}")

        return {"message": "Todo deleted and tasks rescheduled successfully"}
    except Exception as e:
        print(f"Error deleting todo: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting todo: {str(e)}")
