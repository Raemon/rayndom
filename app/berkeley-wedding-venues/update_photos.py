#!/usr/bin/env python3
"""Update the PhotoUrls column in venues.csv based on images found in downloaded markdown files."""
import csv
import re
import os
import argparse
import requests
from urllib.parse import urlparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

DOWNLOADS_DIR = Path(__file__).resolve().parents[2] / "downloads" / "berkeley-wedding-venues"
CSV_PATH = Path(__file__).parent / "venues.csv"

# Patterns to exclude (logos, icons, small images, etc.)
EXCLUDE_PATTERNS = [
    r'/logo', r'logo\.', r'-logo', r'_logo',
    r'/icon', r'icon\.', r'-icon', r'_icon',
    r'favicon', r'sprite', r'pixel',
    r'/partners/', r'/sponsors/',
    r'twitter\.', r'facebook\.', r'instagram\.',
    r'tripadvisor', r'yelp\.', r'google\.',
    r'beyond-green', r'passport-resorts', r'prefer\.',
    r'lexus\.', r'virtuoso', r'fine-hotels',
    r'legend\.png', r'nps\.png',
    r'email-protection',
    r'\d+x\d+\.gif',  # tracking pixels
    r'placeholder',
    r'badge', r'award', r'seal',  # award badges
    r'xoedge\.com', r'weddingwire\.com/assets',  # vendor badges
    r'no-photo', r'spacer\.', r'blank\.',
    r'taptopay', r'payment',
    r'\.svg$',  # SVG icons
    r'share\.svg', r'share\.png',
    r'tribe-events',  # calendar plugin
    r'memfirstweb\.net',  # placeholder images
    r'/themes/', r'/plugins/',  # WordPress theme/plugin assets
]

# Patterns to prioritize (wedding-related)
PRIORITY_PATTERNS = [
    r'wedding', r'bride', r'groom', r'ceremony',
    r'reception', r'venue', r'event', r'celebration',
    r'couple', r'marriage', r'romantic',
]

def extract_domain(url):
    """Extract domain from URL."""
    parsed = urlparse(url)
    domain = parsed.netloc
    if domain.startswith('www.'):
        # Keep www. prefix as the folder might be named that way
        pass
    return domain

def find_markdown_files(domain):
    """Find all markdown files for a domain in the downloads folder."""
    md_files = []
    # Try with and without www. prefix
    domains_to_try = [domain]
    if domain.startswith('www.'):
        domains_to_try.append(domain[4:])
    else:
        domains_to_try.append('www.' + domain)
    for d in domains_to_try:
        domain_dir = DOWNLOADS_DIR / d
        if domain_dir.exists():
            md_files.extend(domain_dir.glob("*.md"))
    return md_files

def extract_images_from_markdown(md_path):
    """Extract image URLs from a markdown file."""
    images = []
    try:
        content = md_path.read_text(encoding='utf-8', errors='ignore')
        # Match markdown image syntax: ![alt](url)
        pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        matches = re.findall(pattern, content)
        for alt, url in matches:
            if url.startswith('http'):
                images.append((alt.lower(), url))
    except Exception as e:
        print(f"Error reading {md_path}: {e}")
    return images

def should_exclude(url, alt=''):
    """Check if an image should be excluded."""
    url_lower = url.lower()
    alt_lower = alt.lower()
    for pattern in EXCLUDE_PATTERNS:
        if re.search(pattern, url_lower) or re.search(pattern, alt_lower):
            return True
    # Exclude if URL doesn't look like an image
    if not any(ext in url_lower for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
        # Allow CDN URLs that might not have extensions
        if 'squarespace-cdn' not in url_lower and 'cloudfront' not in url_lower and 'cache.marriott' not in url_lower and 'getbento' not in url_lower:
            return True
    return False

def score_image(url, alt=''):
    """Score an image - higher score = more relevant for weddings."""
    score = 0
    url_lower = url.lower()
    alt_lower = alt.lower()
    for pattern in PRIORITY_PATTERNS:
        if re.search(pattern, url_lower):
            score += 10
        if re.search(pattern, alt_lower):
            score += 5
    # Prefer larger images (based on URL patterns like -1279x800)
    size_match = re.search(r'-(\d+)x(\d+)', url_lower)
    if size_match:
        w, h = int(size_match.group(1)), int(size_match.group(2))
        if w >= 800 or h >= 600:
            score += 3
    # Prefer jpg/jpeg over other formats
    if '.jpg' in url_lower or '.jpeg' in url_lower:
        score += 1
    return score

def check_image_url(url, timeout=10):
    """Check if an image URL is accessible. Returns (url, is_alive, status_code)."""
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        # Consider 200-299 as success, also 304 (Not Modified)
        is_alive = response.status_code in range(200, 400)
        return (url, is_alive, response.status_code)
    except requests.exceptions.Timeout:
        return (url, False, 'timeout')
    except requests.exceptions.ConnectionError:
        return (url, False, 'connection_error')
    except Exception as e:
        return (url, False, str(e)[:30])

def check_dead_links(rows):
    """Check all photo URLs for dead links."""
    all_urls = []
    url_to_venues = {}  # Map URL to venue names for reporting
    for row in rows:
        photos = row.get('PhotoUrls', '')
        if photos:
            for url in photos.split('|'):
                url = url.strip()
                if url:
                    all_urls.append(url)
                    if url not in url_to_venues:
                        url_to_venues[url] = []
                    url_to_venues[url].append(row['Name'])
    if not all_urls:
        print("No photo URLs to check")
        return {}
    print(f"\nChecking {len(all_urls)} unique image URLs for dead links...")
    dead_urls = {}
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_image_url, url): url for url in all_urls}
        checked = 0
        for future in as_completed(futures):
            url, is_alive, status = future.result()
            checked += 1
            if checked % 20 == 0:
                print(f"  Checked {checked}/{len(all_urls)}...")
            if not is_alive:
                dead_urls[url] = status
                venues = url_to_venues.get(url, ['Unknown'])
                print(f"  DEAD: {url[:70]}... ({status}) - {', '.join(venues)}")
    print(f"\nFound {len(dead_urls)} dead links out of {len(all_urls)} total")
    return dead_urls

def get_best_images(domain, max_images=5):
    """Get the best wedding-related images for a domain."""
    md_files = find_markdown_files(domain)
    all_images = []
    seen_urls = set()
    for md_file in md_files:
        images = extract_images_from_markdown(md_file)
        for alt, url in images:
            if url in seen_urls:
                continue
            if should_exclude(url, alt):
                continue
            seen_urls.add(url)
            score = score_image(url, alt)
            all_images.append((score, alt, url))
    # Sort by score (highest first)
    all_images.sort(key=lambda x: -x[0])
    # Return top N URLs
    return [url for score, alt, url in all_images[:max_images]]

def remove_dead_urls_from_venues(rows, dead_urls):
    """Remove dead URLs from venue photo lists."""
    updated_count = 0
    for row in rows:
        photos = row.get('PhotoUrls', '')
        if not photos:
            continue
        url_list = [u.strip() for u in photos.split('|') if u.strip()]
        new_list = [u for u in url_list if u not in dead_urls]
        if len(new_list) != len(url_list):
            removed = len(url_list) - len(new_list)
            print(f"  {row['Name']}: Removed {removed} dead link(s)")
            row['PhotoUrls'] = '|'.join(new_list)
            updated_count += 1
    return updated_count

def main():
    parser = argparse.ArgumentParser(description='Update photo URLs in venues.csv')
    parser.add_argument('--check-links', action='store_true', help='Check for dead image links')
    parser.add_argument('--remove-dead', action='store_true', help='Remove dead links from CSV')
    parser.add_argument('--update', action='store_true', help='Update photos from downloaded markdown')
    args = parser.parse_args()
    # Default to update if no args
    if not args.check_links and not args.remove_dead and not args.update:
        args.update = True
    # Read existing CSV
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)
    updated_count = 0
    # Check for dead links
    dead_urls = {}
    if args.check_links or args.remove_dead:
        dead_urls = check_dead_links(rows)
        if args.remove_dead and dead_urls:
            updated_count += remove_dead_urls_from_venues(rows, dead_urls)
    # Update PhotoUrls from markdown
    if args.update:
        for row in rows:
            venue_url = row.get('VenueUrl', '')
            if not venue_url:
                continue
            domain = extract_domain(venue_url)
            images = get_best_images(domain, max_images=5)
            old_photos = row.get('PhotoUrls', '')
            if images:
                # Join multiple URLs with pipe (matches TSX parser)
                new_photos = '|'.join(images)
                if new_photos != old_photos:
                    print(f"\n{row['Name']} ({domain}):")
                    print(f"  Found {len(images)} images (was: {len(old_photos.split('|')) if old_photos else 0})")
                    for img in images[:3]:  # Show first 3
                        print(f"    - {img[:80]}...")
                    row['PhotoUrls'] = new_photos
                    updated_count += 1
            elif old_photos:
                # No valid images found - check if old photos should be cleared
                # Only clear if old photos contain known bad patterns
                if any(bad in old_photos.lower() for bad in ['xoedge', 'badge', 'taptopay', 'spacer']):
                    print(f"\n{row['Name']} ({domain}): Clearing bad images")
                    row['PhotoUrls'] = ''
                    updated_count += 1
    if updated_count > 0:
        print(f"\n\nUpdated {updated_count} venues")
        # Write back to CSV
        with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Saved to {CSV_PATH}")
    else:
        print("\nNo changes made")

if __name__ == '__main__':
    main()
