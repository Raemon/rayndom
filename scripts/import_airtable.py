import json
import os
import urllib.request


def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value


def get_required_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise Exception(f"Missing {key}")
    return value


def post_json(url: str, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    load_env_file()
    base_url = os.environ.get("TIMER_BASE_URL", "http://localhost:3000")
    airtable_api_key = get_required_env("AIRTABLE_API_KEY")
    base_id = os.environ.get("AIRTABLE_BASE_ID", "appMDZoMR5OR3ugxH")
    table_id = os.environ.get("AIRTABLE_TABLE_ID", "tblFuIbKR4Zfhgxsw")
    view_id = os.environ.get("AIRTABLE_VIEW_ID", "viwGQKQFdYKiwtfi0")
    datetime_field = os.environ.get("AIRTABLE_DATETIME_FIELD", "Datetime")
    ray_notes_field = os.environ.get("AIRTABLE_RAY_NOTES_FIELD", "Ray Notes")
    assistant_notes_field = os.environ.get("AIRTABLE_ASSISTANT_NOTES_FIELD", "Mabel Notes")

    result = post_json(
        f"{base_url}/api/timer/import-airtable",
        {
            "apiKey": airtable_api_key,
            "baseId": base_id,
            "tableId": table_id,
            "viewId": view_id,
            "datetimeField": datetime_field,
            "rayNotesField": ray_notes_field,
            "assistantNotesField": assistant_notes_field,
        },
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
