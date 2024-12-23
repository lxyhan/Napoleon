import firebase_admin
from firebase_admin import credentials, firestore

# Replace with the path to your Firebase service account key JSON file
cred = credentials.Certificate("app/firebase-keys.json")
firebase_admin.initialize_app(cred)

# Firestore database instance
db = firestore.client()
