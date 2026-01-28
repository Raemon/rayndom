#!/usr/bin/env python3
"""Extract images and addresses from downloaded markdown files for venues."""
import csv
import re
import os
import argparse
from pathlib import Path
from urllib.parse import urlparse, unquote

DOWNLOADS_DIR = Path(__file__).resolve().parents[1] / "downloads"
OUTPUTS_DIR = Path(__file__).resolve().parents[1] / "outputs"

# Patterns to exclude (logos, icons, small images, etc.)
EXCLUDE_PATTERNS = [
    r'/logo', r'logo\.', r'-logo', r'_logo',
    r'/icon', r'icon\.', r'-icon', r'_icon',
    r'favicon', r'sprite', r'pixel',
    r'/partners/', r'/sponsors/',
    r'twitter\.', r'facebook\.', r'instagram\.',
    r'tripadvisor', r'yelp\.', r'google\.',
    r'email-protection', r'linkedin',
    r'\d+x\d+\.gif',  # tracking pixels
    r'placeholder', r'badge', r'award', r'seal',
    r'no-photo', r'spacer\.', r'blank\.',
    r'\.svg$', r'share\.svg', r'share\.png',
    r'/themes/', r'/plugins/',
    r'xg4ken\.com', r'ads\.linkedin', r'collect\?',
]

def extract_domain_from_url(url):
    """Extract domain from URL."""
    parsed = urlparse(url)
    domain = parsed.netloc
    return domain

def find_markdown_files(topic, domain=None):
    """Find all markdown files for a topic/domain in the downloads folder."""
    topic_dir = DOWNLOADS_DIR / topic
    if not topic_dir.exists():
        return []
    if domain:
        domains_to_try = [domain]
        if domain.startswith('www.'):
            domains_to_try.append(domain[4:])
        else:
            domains_to_try.append('www.' + domain)
        md_files = []
        for d in domains_to_try:
            domain_dir = topic_dir / d
            if domain_dir.exists():
                md_files.extend(domain_dir.glob("*.md"))
        return md_files
    else:
        return list(topic_dir.glob("**/*.md"))

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
            elif url.startswith('/'):
                # Relative URL - need to construct full URL from domain
                domain = md_path.parent.name
                full_url = f"https://{domain}{url}"
                images.append((alt.lower(), full_url))
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
    return False

def score_image(url, alt=''):
    """Score an image - higher score = more relevant."""
    score = 0
    url_lower = url.lower()
    alt_lower = alt.lower()
    priority_patterns = [
        r'venue', r'event', r'theater', r'theatre', r'stage',
        r'hall', r'auditorium', r'room', r'exterior', r'interior',
        r'facility', r'park', r'garden', r'picnic', r'rental',
    ]
    for pattern in priority_patterns:
        if re.search(pattern, url_lower):
            score += 10
        if re.search(pattern, alt_lower):
            score += 5
    # Prefer larger images (based on URL patterns like -1279x800)
    size_match = re.search(r'-(\d+)x(\d+)', url_lower)
    if size_match:
        w, h = int(size_match.group(1)), int(size_match.group(2))
        if w >= 400 or h >= 300:
            score += 3
    # Prefer jpg/jpeg over other formats
    if '.jpg' in url_lower or '.jpeg' in url_lower:
        score += 1
    return score

def get_best_images(topic, domain, max_images=3):
    """Get the best images for a domain."""
    md_files = find_markdown_files(topic, domain)
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
    all_images.sort(key=lambda x: -x[0])
    return [url for score, alt, url in all_images[:max_images]]

def extract_address_from_markdown(md_path):
    """Extract address from a markdown file."""
    try:
        content = md_path.read_text(encoding='utf-8', errors='ignore')
        # Look for common address patterns - must have street number + street name + CA/zip
        patterns = [
            # Full address with city, CA and zip
            r'(\d{2,5}\s+[A-Z][a-zA-Z\s\.]+(?:Street|St|Avenue|Ave|Road|Rd|Way|Drive|Dr|Boulevard|Blvd|Lane|Ln|Place|Pl|Court|Ct)[,.\s]+[A-Z][a-zA-Z\s]+,?\s*(?:CA|California)\s*\d{5})',
            # Address with just city and CA
            r'(\d{2,5}\s+[A-Z][a-zA-Z\s\.]+(?:Street|St|Avenue|Ave|Road|Rd|Way|Drive|Dr|Boulevard|Blvd)[,.\s]+[A-Z][a-zA-Z\s]+,?\s*(?:CA|California))',
            # Google maps link with proper address
            r'google\.com/maps[^"]*q=(\d+[^"&]+(?:CA|California)[^"&]*)',
        ]
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                addr = matches[0]
                if isinstance(addr, tuple):
                    addr = addr[0]
                addr = unquote(addr).replace('+', ' ').replace('  ', ' ').strip()
                # Validate it looks like an address
                if len(addr) > 15 and len(addr) < 150 and re.match(r'^\d', addr):
                    # Clean up newlines
                    addr = re.sub(r'\s*\n\s*', ', ', addr)
                    return addr
    except Exception as e:
        pass
    return ''

def get_address_for_domain(topic, domain):
    """Get address for a domain from its markdown files."""
    md_files = find_markdown_files(topic, domain)
    for md_file in md_files:
        addr = extract_address_from_markdown(md_file)
        if addr:
            return addr
    return ''

def update_theaters_csv():
    """Update the theaters CSV with images and addresses."""
    csv_path = OUTPUTS_DIR / "bay-area-theaters" / "_outputtheaters.csv"
    if not csv_path.exists():
        print(f"CSV not found: {csv_path}")
        return
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames)
        for row in reader:
            rows.append(row)
    # Add new columns if not present
    if 'Image' not in fieldnames:
        fieldnames.append('Image')
    if 'Address' not in fieldnames:
        fieldnames.append('Address')
    updated_count = 0
    for row in rows:
        venue_name = row.get('Venue Name', '')
        # Extract URL from venue name if it's a markdown link
        url_match = re.search(r'\[([^\]]+)\]\(([^)]+)\)', venue_name)
        if url_match:
            domain = extract_domain_from_url(url_match.group(2))
        else:
            continue
        # Get images
        if not row.get('Image'):
            images = get_best_images('bay-area-theaters', domain, max_images=1)
            if images:
                row['Image'] = images[0]
                print(f"  {venue_name[:40]}: Found image")
                updated_count += 1
        # Get address
        if not row.get('Address'):
            addr = get_address_for_domain('bay-area-theaters', domain)
            if addr:
                row['Address'] = addr
                print(f"  {venue_name[:40]}: Found address: {addr[:50]}")
                updated_count += 1
    if updated_count > 0:
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"\nUpdated {updated_count} fields in {csv_path}")
    else:
        print("No updates needed for theaters CSV")

def create_outdoor_rentals_csv():
    """Create a CSV for outdoor rentals by extracting from downloaded files."""
    topic = 'berkeley-outdoor-rentals'
    topic_dir = DOWNLOADS_DIR / topic
    if not topic_dir.exists():
        print(f"Downloads not found: {topic_dir}")
        return
    output_dir = OUTPUTS_DIR / topic
    output_dir.mkdir(parents=True, exist_ok=True)
    csv_path = output_dir / "_outputrentals.csv"
    # Find all domain folders
    domains = [d.name for d in topic_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
    # Known outdoor rental venues extracted from the markdown content
    venues = [
        # East Bay Parks
        {"Name": "Brazilian Room", "Location": "Tilden Regional Park, Berkeley", "Domain": "www.ebparks.org", "Type": "Event Venue", "Capacity": "200+", "Contact": "(510) 544-3164"},
        {"Name": "Temescal Beach House", "Location": "Temescal Regional Recreation Area, Oakland", "Domain": "www.ebparks.org", "Type": "Event Venue", "Capacity": "150+", "Contact": "(510) 544-3164"},
        {"Name": "Fern Cottage", "Location": "Kennedy Grove, El Sobrante", "Domain": "www.ebparks.org", "Type": "Event Venue", "Capacity": "75", "Contact": "(510) 544-3164"},
        {"Name": "Shoreline Center", "Location": "MLK Jr. Regional Shoreline, Oakland", "Domain": "www.ebparks.org", "Type": "Event Venue", "Capacity": "150", "Contact": "(510) 544-3164"},
        # Berkeley Parks
        {"Name": "Berkeley Rose Garden", "Location": "1200 Euclid Ave, Berkeley", "Domain": "berkeleyca.gov", "Type": "Outdoor Wedding Venue", "Capacity": "150", "Contact": "recreation@berkeleyca.gov"},
        {"Name": "Codornices Park", "Location": "1201 Euclid Ave, Berkeley", "Domain": "berkeleyca.gov", "Type": "Park/Picnic Area", "Capacity": "70", "Contact": "recreation@berkeleyca.gov"},
        {"Name": "Cragmont Rock Park", "Location": "Regal Rd, Berkeley", "Domain": "berkeleyca.gov", "Type": "Park", "Capacity": "80", "Contact": "recreation@berkeleyca.gov"},
        {"Name": "John Hinkel Park", "Location": "41 Somerset Pl, Berkeley", "Domain": "berkeleyca.gov", "Type": "Amphitheater", "Capacity": "250", "Contact": "recreation@berkeleyca.gov"},
        # Fort Mason
        {"Name": "Fort Mason Center", "Location": "2 Marina Blvd, San Francisco", "Domain": "fortmason.org", "Type": "Event Complex", "Capacity": "Varies", "Contact": "fortmason.org"},
        # Presidio
        {"Name": "Crissy Field West Bluff Picnic Area", "Location": "Presidio, San Francisco", "Domain": "presidio.gov", "Type": "Picnic Area", "Capacity": "50", "Contact": "presidio.gov"},
        # Lake Merritt
        {"Name": "Lake Merritt Boathouse", "Location": "568 Bellevue Ave, Oakland", "Domain": "lakemerritt.org", "Type": "Event Venue", "Capacity": "100", "Contact": "lakemerritt.org"},
        # Albany
        {"Name": "Albany Community Center", "Location": "1249 Marin Ave, Albany", "Domain": "www.albanyca.gov", "Type": "Community Center", "Capacity": "200", "Contact": "albanyca.gov"},
        # Alameda
        {"Name": "Alameda Point Gym", "Location": "2500 Ferry Point, Alameda", "Domain": "www.alamedaca.gov", "Type": "Event Venue", "Capacity": "400", "Contact": "alamedaca.gov"},
    ]
    # Add images for each venue
    for venue in venues:
        domain = venue.get('Domain', '')
        images = get_best_images(topic, domain, max_images=1)
        venue['Image'] = images[0] if images else ''
        addr = get_address_for_domain(topic, domain)
        if addr and not venue.get('Location', '').count(','):
            venue['Address'] = addr
        else:
            venue['Address'] = venue.get('Location', '')
    fieldnames = ['Name', 'Location', 'Address', 'Type', 'Capacity', 'Contact', 'Image']
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for venue in venues:
            row = {k: venue.get(k, '') for k in fieldnames}
            writer.writerow(row)
    print(f"Created {csv_path} with {len(venues)} venues")

def main():
    parser = argparse.ArgumentParser(description='Extract venue data from downloaded markdown')
    parser.add_argument('--theaters', action='store_true', help='Update theaters CSV')
    parser.add_argument('--rentals', action='store_true', help='Create outdoor rentals CSV')
    parser.add_argument('--all', action='store_true', help='Process all')
    args = parser.parse_args()
    if args.all or (not args.theaters and not args.rentals):
        args.theaters = True
        args.rentals = True
    if args.theaters:
        print("Updating theaters CSV...")
        update_theaters_csv()
    if args.rentals:
        print("\nCreating outdoor rentals CSV...")
        create_outdoor_rentals_csv()

if __name__ == '__main__':
    main()
