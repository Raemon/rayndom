#!/usr/bin/env python3
"""
Calculate driving distances from wedding venues to Downtown Berkeley BART.
Uses free OSRM (Open Source Routing Machine) for routing - no API key needed.
"""
import csv
import time
import requests
import re

DOWNTOWN_BERKELEY_BART = (37.8701, -122.2678)  # lat, lon

def geocode_address(address: str) -> tuple[float, float] | None:
    """Geocode address using Nominatim (free OpenStreetMap geocoder)."""
    # Clean up address for better geocoding
    clean_addr = address.strip()
    if not clean_addr:
        return None
    # Add California if not present
    if 'CA' not in clean_addr and 'California' not in clean_addr:
        clean_addr += ', California'
    url = 'https://nominatim.openstreetmap.org/search'
    params = {'q': clean_addr, 'format': 'json', 'limit': 1, 'countrycodes': 'us'}
    headers = {'User-Agent': 'WeddingVenueDistanceCalculator/1.0'}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data:
            return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"  Geocoding error for '{address}': {e}")
    return None

def get_driving_distance_miles(origin: tuple[float, float], dest: tuple[float, float]) -> float | None:
    """Get driving distance in miles using OSRM (free, no API key)."""
    # OSRM expects lon,lat order
    url = f'http://router.project-osrm.org/route/v1/driving/{origin[1]},{origin[0]};{dest[1]},{dest[0]}'
    params = {'overview': 'false'}
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get('code') == 'Ok' and data.get('routes'):
            meters = data['routes'][0]['distance']
            return round(meters / 1609.34, 1)  # Convert to miles
    except Exception as e:
        print(f"  Routing error: {e}")
    return None

def parse_csv(filepath: str) -> tuple[list[str], list[dict]]:
    """Parse the venues CSV file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = list(reader)
    return headers, rows

def write_csv(filepath: str, headers: list[str], rows: list[dict]):
    """Write venues back to CSV."""
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

def main():
    csv_path = 'venues.csv'
    print(f"Reading {csv_path}...")
    headers, rows = parse_csv(csv_path)
    # Add DistanceMiles column if not present
    if 'DistanceMiles' not in headers:
        # Insert before PhotoUrls (last column)
        photo_idx = headers.index('PhotoUrls') if 'PhotoUrls' in headers else len(headers)
        headers.insert(photo_idx, 'DistanceMiles')
    print(f"Found {len(rows)} venues. Calculating distances to Downtown Berkeley BART...")
    print(f"Target: {DOWNTOWN_BERKELEY_BART}")
    print()
    for i, row in enumerate(rows):
        name = row.get('Name', 'Unknown')
        address = row.get('Address', '')
        existing = row.get('DistanceMiles', '')
        if existing and existing != '':
            print(f"[{i+1}/{len(rows)}] {name}: {existing} mi (cached)")
            continue
        print(f"[{i+1}/{len(rows)}] {name}")
        print(f"  Address: {address}")
        if not address:
            print("  No address, skipping")
            row['DistanceMiles'] = ''
            continue
        # Geocode venue
        venue_coords = geocode_address(address)
        if not venue_coords:
            print("  Could not geocode address")
            row['DistanceMiles'] = ''
            time.sleep(1)  # Rate limiting
            continue
        print(f"  Coords: {venue_coords}")
        # Get driving distance
        distance = get_driving_distance_miles(venue_coords, DOWNTOWN_BERKELEY_BART)
        if distance is not None:
            print(f"  Distance: {distance} miles")
            row['DistanceMiles'] = str(distance)
        else:
            print("  Could not calculate distance")
            row['DistanceMiles'] = ''
        time.sleep(1.1)  # Rate limiting for Nominatim (1 req/sec)
    print()
    print(f"Writing updated {csv_path}...")
    write_csv(csv_path, headers, rows)
    print("Done!")

if __name__ == '__main__':
    main()
