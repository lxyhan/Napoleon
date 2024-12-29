import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import pytz
from your_module_name import get_all_events, get_all_events_by_user, get_busy_times  # Replace `your_module_name` with the actual name of your file


class TestCalendarUtilities(unittest.TestCase):

    @patch("your_module_name.service")  # Mock the Google Calendar service
    def test_get_all_events(self, mock_service):
        # Mock the calendarList() response
        mock_service.calendarList().list().execute.return_value = {
            "items": [
                {"id": "primary"},
                {"id": "work"},
                {"id": "personal"}
            ]
        }

        # Mock the events().list() response
        mock_service.events().list().execute.side_effect = [
            {"items": [{"id": "1", "start": {"dateTime": "2024-01-01T10:00:00Z"}, "end": {"dateTime": "2024-01-01T11:00:00Z"}}]},
            {"items": [{"id": "2", "start": {"dateTime": "2024-01-02T15:00:00Z"}, "end": {"dateTime": "2024-01-02T16:00:00Z"}}]},
            {"items": []}  # No events in the "personal" calendar
        ]

        # Define the time range
        start_time = datetime(2024, 1, 1, tzinfo=pytz.utc)
        end_time = datetime(2024, 1, 3, tzinfo=pytz.utc)

        # Call the function
        events = get_all_events(start_time, end_time)

        # Assertions
        self.assertEqual(len(events), 2)  # Two events were mocked
        self.assertEqual(events[0]["id"], "1")
        self.assertEqual(events[1]["id"], "2")

    @patch("your_module_name.get_all_events")  # Mock get_all_events
    def test_get_all_events_by_user(self, mock_get_all_events):
        # Mock the get_all_events response
        mock_get_all_events.return_value = [
            {"id": "1", "creator": {"email": "other_user@example.com"}},
            {"id": "2", "creator": {"email": "hanlyu2005@gmail.com"}},
            {"id": "3", "creator": {"email": "another_user@example.com"}}
        ]

        # Define the time range
        start_time = datetime(2024, 1, 1, tzinfo=pytz.utc)
        end_time = datetime(2024, 1, 3, tzinfo=pytz.utc)
        user_email = "hanlyu2005@gmail.com"

        # Call the function
        immutable_events = get_all_events_by_user(start_time, end_time, user_email)

        # Assertions
        self.assertEqual(len(immutable_events), 2)  # Two events are not created by the user
        self.assertEqual(immutable_events[0]["id"], "1")
        self.assertEqual(immutable_events[1]["id"], "3")

    @patch("your_module_name.get_all_events_by_user")  # Mock get_all_events_by_user
    def test_get_busy_times(self, mock_get_all_events_by_user):
        # Mock the get_all_events_by_user response
        mock_get_all_events_by_user.return_value = [
            {"id": "1", "start": {"dateTime": "2024-01-01T10:00:00Z"}, "end": {"dateTime": "2024-01-01T11:00:00Z"}},
            {"id": "2", "start": {"dateTime": "2024-01-02T15:00:00Z"}, "end": {"dateTime": "2024-01-02T16:00:00Z"}}
        ]

        # Define the time range
        start_time = datetime(2024, 1, 1, tzinfo=pytz.utc)
        end_time = datetime(2024, 1, 3, tzinfo=pytz.utc)

        # Call the function
        busy_times = get_busy_times(start_time, end_time)

        # Assertions
        self.assertEqual(len(busy_times), 3)  # Two events + one nighttime range
        self.assertEqual(busy_times[0]["start"], "2024-01-01T10:00:00Z")
        self.assertEqual(busy_times[1]["start"], "2024-01-02T15:00:00Z")
        self.assertIn("22:00", busy_times[2]["start"])  # Nighttime starts at 10 PM

