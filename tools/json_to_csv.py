#!/usr/bin/env python3
"""
Generic JSON-to-CSV converter. Reads all JSON files from a directory and
outputs a single CSV file.

LLM USAGE:
    python tools/json_to_csv.py <input_dir> --output <output.csv>
    python tools/json_to_csv.py <input_dir> --output <output.csv> --sort-by date
    python tools/json_to_csv.py <input_dir> --output <output.csv> --sort-by date --link-column title=url
    python tools/json_to_csv.py <input_dir> --output <output.csv> --columns title,date,category,quote

    --link-column title=url  Makes 'title' a clickable link using the 'url' field value.
                             The url column is omitted from the CSV (per /make-csv convention).
    --sort-by field          Sort rows by this field.
    --columns col1,col2      Only include these columns (in this order). Default: all fields found.
    --exclude col1,col2      Exclude these columns.

    Reads every *.json file in <input_dir> (non-recursive).
    Each JSON file should contain a single object (one row) or an array of objects.
"""
import sys
import os
import csv
import json
import argparse
from pathlib import Path

def load_json_files(input_dir):
    """Load all JSON files from directory, return list of dicts."""
    rows = []
    json_files = sorted(Path(input_dir).glob('*.json'))
    # Skip hidden/progress files
    json_files = [f for f in json_files if not f.name.startswith('.')]
    for filepath in json_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if isinstance(data, list):
                rows.extend(data)
            elif isinstance(data, dict):
                rows.append(data)
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}")
    return rows

def get_all_columns(rows):
    """Get all unique column names preserving first-seen order."""
    columns = []
    seen = set()
    for row in rows:
        for key in row.keys():
            if key not in seen:
                columns.append(key)
                seen.add(key)
    return columns

def apply_link_column(rows, columns, link_spec):
    """Make a column a clickable link. link_spec is 'display_col=url_col'.
    Modifies rows in place, removes url_col from columns."""
    display_col, url_col = link_spec.split('=', 1)
    if url_col in columns:
        columns.remove(url_col)
    for row in rows:
        url = row.get(url_col, '')
        display = row.get(display_col, '')
        if url and display:
            row[display_col] = f'=HYPERLINK("{url}", "{display}")'
        # Remove the url field so it doesn't appear
        row.pop(url_col, None)
    return rows, columns

def write_csv(rows, columns, output_path, sort_by=None):
    """Write rows to CSV file."""
    if sort_by and sort_by in columns:
        rows.sort(key=lambda r: r.get(sort_by, ''))
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {output_path}")
    print(f"Columns: {', '.join(columns)}")

def main():
    parser = argparse.ArgumentParser(description='Convert JSON files to CSV')
    parser.add_argument('input_dir', help='Directory containing JSON files')
    parser.add_argument('--output', '-o', required=True, help='Output CSV file path')
    parser.add_argument('--sort-by', help='Sort rows by this field')
    parser.add_argument('--link-column', help='Make column a clickable link: display_col=url_col')
    parser.add_argument('--columns', help='Comma-separated list of columns to include (in order)')
    parser.add_argument('--exclude', help='Comma-separated list of columns to exclude')
    args = parser.parse_args()
    if not os.path.isdir(args.input_dir):
        print(f"ERROR: Directory not found: {args.input_dir}")
        sys.exit(1)
    rows = load_json_files(args.input_dir)
    if not rows:
        print(f"No JSON files found in {args.input_dir}")
        sys.exit(0)
    print(f"Loaded {len(rows)} records from {args.input_dir}")
    columns = get_all_columns(rows)
    if args.columns:
        columns = [c.strip() for c in args.columns.split(',')]
    if args.exclude:
        exclude = {c.strip() for c in args.exclude.split(',')}
        columns = [c for c in columns if c not in exclude]
    if args.link_column:
        rows, columns = apply_link_column(rows, columns, args.link_column)
    write_csv(rows, columns, args.output, sort_by=args.sort_by)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
