#!/usr/bin/env python3
"""
Read a JavaScript-rendered page using Playwright.

Usage:
    python read_js_page.py <url>                    # Print rendered HTML
    python read_js_page.py --links <url>            # Print all links (href and text)
    python read_js_page.py --links-json <url>       # Print links as JSON
    python read_js_page.py --text <url>             # Print text content only
    python read_js_page.py --wait <seconds> <url>   # Custom wait time (default: 2s)

Examples:
    python read_js_page.py https://www.lesswrong.com/s/KfCjeconYRdFbMxsy
    python read_js_page.py --links https://www.lesswrong.com/s/KfCjeconYRdFbMxsy
    python read_js_page.py --links-json https://www.lesswrong.com/s/KfCjeconYRdFbMxsy

Dependencies: pip install playwright && playwright install chromium
"""
import sys
import json
import argparse
from urllib.parse import urljoin

def ensure_playwright():
    """Check if playwright is installed, provide install instructions if not."""
    try:
        from playwright.sync_api import sync_playwright
        return True
    except ImportError:
        print("Playwright not installed. Run:")
        print("  pip install playwright")
        print("  playwright install chromium")
        sys.exit(1)

def read_page(url, wait_seconds=2):
    """Load page with Playwright and return rendered HTML."""
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until='networkidle')
        # Additional wait for JS frameworks to finish rendering
        page.wait_for_timeout(wait_seconds * 1000)
        html = page.content()
        browser.close()
        return html

def extract_links(html, base_url):
    """Extract all links from HTML, returning list of {href, text} dicts."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    links = []
    seen_hrefs = set()
    for a in soup.find_all('a', href=True):
        href = a['href']
        # Make absolute URL
        absolute_href = urljoin(base_url, href)
        # Get text content, strip whitespace
        text = a.get_text(strip=True)
        # Skip duplicates and empty hrefs
        if absolute_href and absolute_href not in seen_hrefs:
            seen_hrefs.add(absolute_href)
            links.append({'href': absolute_href, 'text': text or '(no text)'})
    return links

def extract_text(html):
    """Extract text content from HTML."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    # Remove script and style elements
    for element in soup(['script', 'style', 'nav', 'header', 'footer']):
        element.decompose()
    return soup.get_text(separator='\n', strip=True)

def main():
    parser = argparse.ArgumentParser(description='Read JavaScript-rendered pages')
    parser.add_argument('url', help='URL to load')
    parser.add_argument('--links', action='store_true', help='Extract and print links')
    parser.add_argument('--links-json', action='store_true', help='Extract links as JSON')
    parser.add_argument('--text', action='store_true', help='Extract text content only')
    parser.add_argument('--wait', type=float, default=2, help='Wait time in seconds after networkidle (default: 2)')
    args = parser.parse_args()
    ensure_playwright()
    print(f"Loading {args.url}...", file=sys.stderr)
    html = read_page(args.url, args.wait)
    print(f"Page loaded ({len(html)} bytes)", file=sys.stderr)
    if args.links or args.links_json:
        links = extract_links(html, args.url)
        if args.links_json:
            print(json.dumps(links, indent=2))
        else:
            for link in links:
                print(f"{link['href']}")
                if link['text'] and link['text'] != '(no text)':
                    print(f"  -> {link['text']}")
    elif args.text:
        print(extract_text(html))
    else:
        print(html)

if __name__ == '__main__':
    main()
