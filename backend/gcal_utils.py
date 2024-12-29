# gcal_utils.py
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.service_account import Credentials
from datetime import datetime, timedelta
import pytz

# Google Calendar API Setup
SCOPES = ['https://www.googleapis.com/auth/calendar']
SERVICE_ACCOUNT_FILE = "./smart-calendar.json"  # Update this path
credentials = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
service = build('calendar', 'v3', credentials=credentials)

def get_local_time():
    """
    Get the current local time in America/New_York timezone.
    """
    local_tz = pytz.timezone("America/New_York")
    return datetime.now(local_tz)

def get_all_events(start_time, end_time):
    """
    Fetch all events from Google Calendar across all accessible calendars
    within a specified time range.
    """
    try:
        # List all calendars the user has access to
        calendars = service.calendarList().list().execute()
        calendar_ids = [calendar['id'] for calendar in calendars.get('items', [])]

        # Fetch events from all calendars within the given time range
        all_events = []
        for calendar_id in calendar_ids:
            events_result = service.events().list(
                calendarId=calendar_id,
                timeMin=start_time.isoformat(),
                timeMax=end_time.isoformat(),
                singleEvents=True,
                orderBy="startTime"
            ).execute()
            events = events_result.get('items', [])
            for event in events:
                event["calendarId"] = calendar_id  # Tag the event with its calendar ID
                all_events.append(event)

        return all_events
    except HttpError as error:
        print(f"An error occurred: {error}")
        return []

def get_all_events_by_user(start_time, end_time, user_email):
    """
    Fetch all events that the user didn't create.
    """
    try:
        # Fetch all events within the given time range
        all_events = get_all_events(start_time, end_time)

        # Filter events not created by the user
        immutable_events = []
        for event in all_events:
            # Check if the event was not created by the user
            if "creator" in event and event["creator"]["email"] != user_email:
                immutable_events.append(event)

        return immutable_events
    except Exception as error:
        print(f"An error occurred while fetching immutable events: {error}")
        return []


def get_busy_times(start_time, end_time):
    """
    Query Google Calendar to retrieve busy slots based on immutable events
    (i.e., events the user didn't create) and include times between 10 PM and 8 AM as busy.
    """
    try:
        # Step 1: Get all immutable events (events the user didn't create)
        immutable_events = get_all_events_by_user(start_time, end_time, "hanlyu2005@gmail.com")

        # Step 2: Extract busy times from immutable events
        busy_times = []
        for event in immutable_events:
            if "start" in event and "end" in event:
                busy_times.append({
                    "start": event["start"].get("dateTime", event["start"].get("date")),
                    "end": event["end"].get("dateTime", event["end"].get("date"))
                })

        # Step 3: Add nighttime (10 PM - 8 AM) as busy
        current_day = start_time
        while current_day < end_time:
            # Define nighttime range for the current day
            night_start = current_day.replace(hour=22, minute=0, second=0, microsecond=0)  # 10 PM
            night_end = (current_day + timedelta(days=1)).replace(hour=8, minute=0, second=0, microsecond=0)  # 8 AM next day

            # Only include nighttime if it falls within the start_time and end_time range
            if night_start < end_time and night_end > start_time:
                busy_times.append({
                    "start": max(night_start.isoformat(), start_time.isoformat()),
                    "end": min(night_end.isoformat(), end_time.isoformat())
                })

            # Move to the next day
            current_day += timedelta(days=1)

        return busy_times
    except Exception as error:
        print(f"An error occurred in get_busy_times: {error}")
        return []


def create_gcal_event(task, start_time, end_time):
    """
    Create a Google Calendar event for the given task.
    """
    try:
        calendar_id = '18e35445374afb9fd5e35bc56cece6508da0d1a224aa1280944cfc8261e6f8d8@group.calendar.google.com'
        event_body = {
            'summary': task["name"],
            'description': f"Priority: {task.get('priority', 'Low')}\nTask Type: {task.get('taskType', '')}\nNotes: {task.get('notes', '')}",
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'America/New_York',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'America/New_York',
            }
        }
        print("Task being scheduled:", task)
        event = service.events().insert(calendarId=calendar_id, body=event_body).execute()
        print("Event created:", event)
        return event
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

def delete_gcal_event(event_id):
    """
    Delete a Google Calendar event by its event ID.
    """
    calendar_id = '18e35445374afb9fd5e35bc56cece6508da0d1a224aa1280944cfc8261e6f8d8@group.calendar.google.com'
    try:
        service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        return True
    except HttpError as error:
        print(f"An error occurred while deleting event: {error}")
        return False

def list_calendars(calendar_id):
    """
    List all calendars accessible by the service account.
    """
    try:
        calendar = service.calendars().get(calendarId=calendar_id).execute()
        print(f"Successfully accessed calendar: {calendar['summary']}")
    except Exception as e:
        print(f"Error accessing calendar: {e}")


def format_dates_for_gpt(gpt_input):
    """
    Formats the tasks, free times, and busy times to include explicit date strings for better clarity when sending to GPT.
    """
    # Format tasks with explicit date strings
    formatted_tasks = []
    for task in gpt_input['tasks']:
        formatted_tasks.append({
            "id": task["id"],
            "name": task["name"],
            "description": task["description"],
            "priority": task["priority"],
            "due_date": datetime.fromisoformat(task["dueDate"]).strftime("%Y-%m-%d %H:%M:%S"),
            "scheduled_date": task.get("scheduledDate"),
            "estimated_time_hours": task["estimatedTime"],
            "gcal_event_id": task.get("gcalEventId")
        })

    # Format free times
    formatted_free_times = []
    for free_time in gpt_input['free_times']:
        formatted_free_times.append({
            "start_date": datetime.fromisoformat(free_time["start"]).strftime("%Y-%m-%d %H:%M:%S"),
            "end_date": datetime.fromisoformat(free_time["end"]).strftime("%Y-%m-%d %H:%M:%S"),
        })

    # Format busy times
    formatted_busy_times = []
    for busy_time in gpt_input['busy_times']:
        formatted_busy_times.append({
            "start_date": datetime.fromisoformat(busy_time["start"]).strftime("%Y-%m-%d %H:%M:%S"),
            "end_date": datetime.fromisoformat(busy_time["end"]).strftime("%Y-%m-%d %H:%M:%S"),
        })

    # Return the formatted data
    return {
        "tasks": formatted_tasks,
        "free_times": formatted_free_times,
        "busy_times": formatted_busy_times,
        "context": gpt_input["context"]
    }