#!/usr/bin/env python3
"""
Wrapper script to extract figures from a PDF and convert them to tables.

This script runs both extract_figures_parallel.py and convert_figures_to_tables.py
in sequence.

Usage:
    python extract_and_convert_figures.py <pdf_path> <output_dir> [--max-workers N] [--api-workers N]
    
Example:
    python extract_and_convert_figures.py downloads/ketamine-in-vitro-safety/10.3390_cells8101139.pdf downloads/ketamine-in-vitro-safety/figures --max-workers 10 --api-workers 5
"""
import os
import sys
import subprocess
import argparse


def main():
    parser = argparse.ArgumentParser(
        description='Extract figures from PDF and convert to tables',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('pdf_path', help='Path to the PDF file')
    parser.add_argument('output_dir', help='Directory to save extracted figures')
    parser.add_argument(
        '--max-workers', '-w',
        type=int,
        default=None,
        help='Maximum number of worker threads for extraction (default: CPU count)'
    )
    parser.add_argument(
        '--api-workers', '-a',
        type=int,
        default=5,
        help='Maximum number of parallel API calls for table conversion (default: 5)'
    )
    parser.add_argument(
        '--min-size', '-m',
        type=int,
        default=50,
        help='Minimum image dimension to extract (default: 50px)'
    )
    
    args = parser.parse_args()
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    extract_script = os.path.join(script_dir, 'extract_figures_parallel.py')
    convert_script = os.path.join(script_dir, 'convert_figures_to_tables.py')
    
    # Build extract command
    extract_cmd = [sys.executable, extract_script, args.pdf_path, args.output_dir]
    if args.max_workers:
        extract_cmd.extend(['--max-workers', str(args.max_workers)])
    if args.min_size:
        extract_cmd.extend(['--min-size', str(args.min_size)])
    
    # Build convert command
    convert_cmd = [sys.executable, convert_script, args.output_dir]
    if args.api_workers:
        convert_cmd.extend(['--api-workers', str(args.api_workers)])
    
    # Run extraction
    print("="*60)
    print("STEP 1: EXTRACTING FIGURES FROM PDF")
    print("="*60)
    result = subprocess.run(extract_cmd)
    if result.returncode != 0:
        print(f"\nError: Figure extraction failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    
    # Run conversion
    print("\n" + "="*60)
    print("STEP 2: CONVERTING FIGURES TO TABLES")
    print("="*60)
    result = subprocess.run(convert_cmd)
    if result.returncode != 0:
        print(f"\nError: Table conversion failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    
    print("\n" + "="*60)
    print("COMPLETE: Both extraction and conversion finished successfully")
    print("="*60)


if __name__ == '__main__':
    main()
