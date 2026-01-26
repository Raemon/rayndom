import json
import os
import urllib.request
from typing import Any


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
        raise Exception(f"Missing {key}. Please set it in your .env file or environment.")
    return value


def fetch_all_airtable_records(base_id: str, table_id: str, view_id: str, api_key: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    offset: str | None = None
    airtable_api_base = "https://api.airtable.com/v0"
    
    while True:
        url = f"{airtable_api_base}/{base_id}/{table_id}"
        params = []
        if view_id:
            params.append(f"view={view_id}")
        if offset:
            params.append(f"offset={offset}")
        params.append("pageSize=100")
        if params:
            url += "?" + "&".join(params)
        
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_key}"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            records.extend(data.get("records", []))
            offset = data.get("offset")
            if not offset:
                break
    
    return records


def main():
    load_env_file()
    base_id = os.environ.get("AIRTABLE_BASE_ID", "appMDZoMR5OR3ugxH")
    table_id = os.environ.get("AIRTABLE_TABLE_ID", "tblFuIbKR4Zfhgxsw")
    view_id = os.environ.get("AIRTABLE_VIEW_ID", "viwGQKQFdYKiwtfi0")
    
    try:
        api_key = get_required_env("AIRTABLE_API_KEY")
    except Exception as e:
        print(f"Error: {e}")
        return
    
    print(f"Fetching records from Airtable...")
    try:
        records = fetch_all_airtable_records(base_id, table_id, view_id, api_key)
        print(f"Found {len(records)} records")
        
        output_file = "airtable_data.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(records)} records to {output_file}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        if e.code == 403:
            print("Permission denied. Please check your API token has access to this base.")
        elif e.code == 404:
            print("Table or view not found. Please check your base_id, table_id, and view_id.")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
