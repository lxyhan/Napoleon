from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.config import db

router = APIRouter()

@router.get("/", status_code=200)
async def get_todays_tasks():
    """
    Fetch tasks scheduled for today from Firestore.
    """
    try:
        # Get today's date in YYYY-MM-DD format
        today_date = datetime.now().strftime("%Y-%m-%d")
        print(f"Fetching tasks for: {today_date}")  # Debugging log

        # Reference to the "calendar" collection for today's date
        calendar_ref = db.collection("calendar").document(today_date)
        time_slots = calendar_ref.collection("time_slots").stream()

        # Retrieve all tasks from the "time_slots" subcollection
        todays_tasks = []
        for slot in time_slots:
            task = slot.to_dict()
            task["timeSlot"] = slot.id  # Include the time slot in the response
            todays_tasks.append(task)

        # If no tasks are found, return an empty list
        if not todays_tasks:
            print(f"No tasks found for {today_date}")  # Debugging log
            return {"date": today_date, "tasks": []}

        # Return the list of tasks
        print(f"Tasks found for {today_date}: {todays_tasks}")  # Debugging log
        return {"date": today_date, "tasks": todays_tasks}

    except Exception as e:
        # Log the error and raise an HTTP exception
        print(f"Error fetching today's tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching today's tasks: {str(e)}")
