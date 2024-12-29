from dotenv import load_dotenv

from openai import OpenAI
import os

load_dotenv()


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    # Use the newer client-based syntax
    completion = client.chat.completions.create(
        model="gpt-4o-mini",  # Replace with your desired model
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Write a haiku about recursion in programming."},
        ]
    )

    # Print the result
    print(completion.choices[0].message)

except Exception as e:
    print(f"An error occurred: {e}")