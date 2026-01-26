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
        
        print(f"Requesting: {url}")
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
        print(f"API Key loaded (first 10 chars: {api_key[:10]}...)")
    except Exception as e:
        print(f"Error: {e}")
        print("\nTo use this script, you need to:")
        print("1. Get your Airtable API key from https://airtable.com/create/tokens")
        print("2. Add it to your .env file as: AIRTABLE_API_KEY=your_key_here")
        return
    
    print(f"Fetching records from Airtable...")
    print(f"Base ID: {base_id}")
    print(f"Table ID: {table_id}")
    print(f"View ID: {view_id}\n")
    
    try:
        print("Testing API token by fetching base metadata...")
        meta_url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
        meta_req = urllib.request.Request(meta_url, headers={"Authorization": f"Bearer {api_key}"})
        try:
            with urllib.request.urlopen(meta_req) as meta_resp:
                meta_data = json.loads(meta_resp.read().decode("utf-8"))
                print(f"✓ Token has access to base. Found {len(meta_data.get('tables', []))} tables.")
        except urllib.error.HTTPError as meta_e:
            print(f"✗ Cannot access base metadata: {meta_e.code} {meta_e.reason}")
            if meta_e.code == 403:
                print("\n⚠️  Your API token doesn't have access to this base.")
                print("To fix this:")
                print("1. Go to https://airtable.com/create/tokens")
                print("2. Edit your token (or create a new one)")
                print("3. Under 'Access', add this base: appMDZoMR5OR3ugxH")
                print("4. Grant 'data.records:read' permission")
                return
        
        print("\nFetching records from table...")
        records = fetch_all_airtable_records(base_id, table_id, view_id, api_key)
        print(f"Found {len(records)} records\n")
        
        if records:
            print("Sample record structure:")
            print(json.dumps(records[0], indent=2))
            print("\n" + "="*80 + "\n")
            
            print("All records:")
            for i, record in enumerate(records, 1):
                print(f"\nRecord {i} (ID: {record.get('id', 'unknown')}):")
                fields = record.get("fields", {})
                for field_name, field_value in fields.items():
                    print(f"  {field_name}: {field_value}")
        else:
            print("No records found in this view.")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        print(f"Response headers: {dict(e.headers)}")
        if e.code == 401:
            print("Authentication failed. Please check your AIRTABLE_API_KEY.")
        elif e.code == 403:
            print("Permission denied. Please check:")
            print("1. Your API token has access to this base")
            print("2. Your API token has the correct scopes (data.records:read)")
            print("3. The base/table/view IDs are correct")
        elif e.code == 404:
            print("Table or view not found. Please check your base_id, table_id, and view_id.")
        try:
            error_body = e.read().decode("utf-8")
            print(f"Error response body: {error_body}")
            try:
                error_json = json.loads(error_body)
                print(f"Error details: {json.dumps(error_json, indent=2)}")
            except:
                pass
        except:
            pass
    except Exception as e:
        print(f"Error fetching data: {e}")


if __name__ == "__main__":
    main()
