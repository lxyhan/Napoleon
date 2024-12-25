from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from app.config import db

router = APIRouter()
load_dotenv()

# Reference to the Firestore "profiles" collection
profiles_collection = db.collection("profiles")

# Define the Pydantic model for Profile
class Profile(BaseModel):
    username: str
    about: str
    short_term_goals: str
    medium_term_goals: str
    long_term_goals: str


@router.get("/")
async def get_profile():
    """
    Retrieve the user's profile. If no profile exists, return a default empty profile.
    """
    try:
        # Fetch the first (and only) profile document
        docs = profiles_collection.limit(1).stream()
        for doc in docs:
            profile = doc.to_dict()
            profile["id"] = doc.id  # Include Firestore document ID
            return profile

        # If no profile exists, return a default empty profile
        return {
            "username": "",
            "about": "",
            "short_term_goals": "",
            "medium_term_goals": "",
            "long_term_goals": ""
        }
    except Exception as e:
        print("Error fetching profile:", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")


@router.put("/")
async def update_profile(profile: Profile):
    """
    Update the user's profile. If no profile exists, create a new one.
    """
    try:
        # Fetch the first (and only) profile document
        docs = profiles_collection.limit(1).stream()
        for doc in docs:
            # Update the existing profile document
            doc_ref = profiles_collection.document(doc.id)
            profile_dict = profile.dict(exclude_unset=True)
            doc_ref.update(profile_dict)
            profile_dict["id"] = doc.id  # Return Firestore document ID
            return profile_dict

        # If no profile exists, create a new one
        profile_dict = profile.dict(exclude_unset=True)
        doc_ref = profiles_collection.add(profile_dict)
        profile_dict["id"] = doc_ref[1].id  # Add Firestore document ID
        return profile_dict
    except Exception as e:
        print("Error updating profile:", str(e))
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")
