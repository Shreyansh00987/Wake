import os
import json
import urllib.request
import urllib.error

API_KEY = "V8ZsKPBhWY7c8sSchiX6NWQ9"
ENDPOINT = "https://dev.to/api/articles"

with open("DEV_POST_DRAFT.md", "r", encoding="utf-8") as f:
    markdown_content = f.read()

# Prepare payload
payload = {
    "article": {
        "title": "Wake: Every Deleted Line Had a Reason (An Archival Git Necropolis)",
        "published": True,
        "body_markdown": markdown_content,
        "main_image": "https://github.com/Shreyansh00987/Wake/raw/main/cover_image.png",
        "tags": ["devchallenge", "hf26challenge", "opensource", "ai"]
    }
}

data = json.dumps(payload).encode("utf-8")
headers = {
    "Content-Type": "application/json",
    "api-key": API_KEY,
    "User-Agent": "WakeDevSubmission/1.0"
}

req = urllib.request.Request(ENDPOINT, data=data, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        print("SUCCESS! Article published.")
        print("Article ID:", res_data.get("id"))
        print("Article URL:", res_data.get("url"))
        print("Title:", res_data.get("title"))
        print("Published:", res_data.get("published"))
        print("Tags:", res_data.get("tags"))
        
        # Save output response for archival
        with open("scratch/submission_response.json", "w", encoding="utf-8") as rf:
            json.dump(res_data, rf, indent=2)

except urllib.error.HTTPError as e:
    error_body = e.read().decode("utf-8")
    print(f"HTTPError {e.code}: {e.reason}")
    print("Response body:", error_body)
except Exception as e:
    print("Error:", e)
