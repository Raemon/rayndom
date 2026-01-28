#!/usr/bin/env python3
"""
Download theater images and update CSV with local paths.
"""
import json
import os
import re
import csv
import requests
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Config
JSON_FILE = "downloads/bay-area-theaters/bay_area_theater_images.json"
CSV_FILE = "outputs/bay-area-theaters/_outputtheaters.csv"
OUTPUT_DIR = "downloads/bay-area-theaters/images"
OUTPUT_CSV = "outputs/bay-area-theaters/_outputtheaters.csv"

def is_image_url(url):
    """Check if URL looks like a direct image link."""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'}
    parsed = urlparse(url)
    path_lower = parsed.path.lower()
    # Check extension
    for ext in image_extensions:
        if path_lower.endswith(ext):
            return True
    # Check common image hosting patterns
    image_hosts = ['staticflickr.com', 'wikimedia.org', 'cloudinary', 'wp-content/uploads', 'assets', 'images']
    url_lower = url.lower()
    for host in image_hosts:
        if host in url_lower:
            # Make sure it's not a gallery page
            if '/gallery/' not in url_lower and '/photos/' not in url_lower or 'staticflickr' in url_lower:
                return True
    return False

def sanitize_filename(name):
    """Convert venue name to safe filename."""
    name = re.sub(r'[^\w\s\-]', '', name)
    name = re.sub(r'\s+', '_', name)
    return name[:100]

def download_image(url, save_path):
    """Download image from URL to save_path."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=30, stream=True)
        response.raise_for_status()
        content_type = response.headers.get('Content-Type', '').lower()
        if 'image' not in content_type and 'octet-stream' not in content_type:
            print(f"  Skipping (not an image): {url} -> {content_type}")
            return None
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"  Downloaded: {save_path}")
        return save_path
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return None

def get_extension_from_url(url):
    """Extract file extension from URL."""
    parsed = urlparse(url)
    path = parsed.path.lower()
    for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']:
        if path.endswith(ext):
            return ext
    # Default to .jpg for unknown
    return '.jpg'

def extract_venue_name_from_csv_field(field):
    """Extract venue name from CSV field like '[Zellerbach Auditorium](url)'."""
    match = re.match(r'\[([^\]]+)\]', field)
    if match:
        return match.group(1)
    return field.strip()

def normalize_venue_name(name):
    """Normalize venue name for matching."""
    name = name.lower()
    # Remove location suffixes
    name = re.sub(r'\s*(berkeley|oakland|san francisco|sf|walnut creek|livermore|richmond|fremont|hayward|san jose|mountain view|alameda|antioch|cupertino|concord)$', '', name, flags=re.I)
    # Remove common words
    name = re.sub(r'\s*(theater|theatre|auditorium|center|hall|stage)$', '', name, flags=re.I)
    name = re.sub(r'[^\w\s]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def main():
    # Load JSON with image URLs
    with open(JSON_FILE, 'r') as f:
        venue_images = json.load(f)
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # Download images and track paths
    downloaded_images = {}  # venue_name -> [local_paths]
    for venue_name, urls in venue_images.items():
        print(f"\nProcessing: {venue_name}")
        venue_dir = os.path.join(OUTPUT_DIR, sanitize_filename(venue_name))
        os.makedirs(venue_dir, exist_ok=True)
        downloaded_images[venue_name] = []
        for i, url in enumerate(urls):
            if not is_image_url(url):
                print(f"  Skipping (not image URL): {url}")
                continue
            ext = get_extension_from_url(url)
            filename = f"image_{i+1}{ext}"
            save_path = os.path.join(venue_dir, filename)
            # Skip if already downloaded
            if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
                print(f"  Already exists: {save_path}")
                downloaded_images[venue_name].append(save_path)
                continue
            result = download_image(url, save_path)
            if result:
                downloaded_images[venue_name].append(result)
    # Build venue name mapping (normalized -> original JSON key)
    json_venue_map = {}
    for venue_name in venue_images.keys():
        normalized = normalize_venue_name(venue_name)
        json_venue_map[normalized] = venue_name
    # Read CSV and update Image column
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    if not rows:
        print("CSV is empty!")
        return
    header = rows[0]
    image_col_idx = header.index('Image') if 'Image' in header else -1
    venue_col_idx = 0  # Venue Name is first column
    if image_col_idx == -1:
        print("No 'Image' column found in CSV")
        return
    updated_count = 0
    for row_idx, row in enumerate(rows[1:], start=1):
        if not row:
            continue
        csv_venue_name = extract_venue_name_from_csv_field(row[venue_col_idx])
        normalized_csv = normalize_venue_name(csv_venue_name)
        # Try to find matching venue in downloaded images
        matched_venue = None
        # Direct match
        if normalized_csv in json_venue_map:
            matched_venue = json_venue_map[normalized_csv]
        else:
            # Fuzzy match - check if normalized names contain each other
            for norm_json, orig_json in json_venue_map.items():
                if normalized_csv in norm_json or norm_json in normalized_csv:
                    matched_venue = orig_json
                    break
        if matched_venue and matched_venue in downloaded_images:
            local_paths = downloaded_images[matched_venue]
            if local_paths:
                # Extract original URL from existing data (first URL if semicolon-separated, or from img tag)
                existing_raw = row[image_col_idx] if row[image_col_idx] else ""
                if existing_raw.startswith('<img'):
                    # Already HTML, extract first src
                    match = re.search(r'src="([^"]+)"', existing_raw)
                    existing = match.group(1) if match else ""
                elif ';' in existing_raw:
                    # Semicolon separated, take first
                    existing = existing_raw.split(';')[0].strip()
                else:
                    existing = existing_raw.strip()
                all_images = [existing] if existing else []
                all_images.extend(local_paths)
                # Generate raw HTML with img tags
                html_imgs = " ".join(f'<img src="{img}">' for img in all_images)
                row[image_col_idx] = html_imgs
                updated_count += 1
                print(f"Updated: {csv_venue_name} -> {len(local_paths)} new images")
    # Write updated CSV
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"\nDone! Updated {updated_count} venues in {OUTPUT_CSV}")
    # Print summary
    total_downloaded = sum(len(paths) for paths in downloaded_images.values())
    print(f"Total images downloaded: {total_downloaded}")

if __name__ == '__main__':
    main()
