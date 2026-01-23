#!/usr/bin/env python3
"""
Download JavaScript-rendered pages using Playwright.

Usage:
    python download_js_pages.py <topic> <url1> [url2] [url3] ...
    python download_js_pages.py --no-crawl <topic> <url1> [url2] ...   # Don't crawl linked pages

Examples:
    python download_js_pages.py "cast-sequence" https://www.lesswrong.com/posts/xyz
    python download_js_pages.py --no-crawl "cast-sequence" url1 url2 url3

Dependencies: pip install playwright beautifulsoup4 html2text && playwright install chromium
"""
import sys
import os
import json
import re
from datetime import datetime
from urllib.parse import urlparse, urljoin, urlunparse
from concurrent.futures import ThreadPoolExecutor, as_completed

def ensure_deps():
    """Check if dependencies are installed."""
    try:
        from playwright.sync_api import sync_playwright
        from bs4 import BeautifulSoup
        import html2text
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Run: pip install playwright beautifulsoup4 html2text && playwright install chromium")
        sys.exit(1)

def get_domain(url):
    """Extract domain from URL."""
    parsed = urlparse(url)
    return parsed.netloc or parsed.path.split('/')[0]

def sanitize_filename(url):
    """Convert URL to filesystem-safe filename."""
    parsed = urlparse(url)
    path = parsed.path.rstrip('/') or 'index'
    path = path.replace('/', '_').replace('\\', '_')
    filename = re.sub(r'[^\w\-_.]', '', path)
    return filename[:200]

def render_page(url, wait_seconds=3):
    """Load page with Playwright and return rendered HTML."""
    from playwright.sync_api import sync_playwright
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until='networkidle', timeout=30000)
            page.wait_for_timeout(wait_seconds * 1000)
            html = page.content()
            browser.close()
            return html
    except Exception as e:
        print(f"Error loading {url}: {e}")
        return None

def html_to_markdown(html):
    """Convert HTML to markdown."""
    from bs4 import BeautifulSoup
    import html2text
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.find('body')
    if not body:
        return ""
    # Remove nav, header, footer, script, style
    for tag in body.find_all(['nav', 'header', 'footer', 'script', 'style']):
        tag.decompose()
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = True
    h.body_width = 0
    return h.handle(str(body))

def extract_links(html, base_url):
    """Extract same-domain links from HTML."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    links = set()
    parsed_base = urlparse(base_url)
    for a in soup.find_all('a', href=True):
        href = a['href']
        absolute = urljoin(base_url, href)
        parsed = urlparse(absolute)
        if parsed.scheme in ('http', 'https') and parsed.netloc == parsed_base.netloc:
            # Normalize: remove fragment and query
            normalized = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
            links.add(normalized)
    return list(links)

def extract_title(html):
    """Extract page title from HTML."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')
    title_tag = soup.find('title')
    if title_tag:
        return title_tag.get_text(strip=True)
    h1 = soup.find('h1')
    if h1:
        return h1.get_text(strip=True)
    return None

def download_url(url, output_dir):
    """Download a single URL and save as markdown."""
    print(f"Downloading: {url}")
    html = render_page(url)
    if not html:
        return None
    title = extract_title(html)
    markdown = html_to_markdown(html)
    # Add URL as header
    header = f"# {title or 'Untitled'}\n\nSource: {url}\n\n---\n\n"
    markdown = header + markdown
    filename = sanitize_filename(url) + ".md"
    filepath = os.path.join(output_dir, filename)
    os.makedirs(output_dir, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"  Saved: {filepath}")
    return {'url': url, 'file': filename, 'title': title}

def main():
    args = sys.argv[1:]
    no_crawl = False
    if '--no-crawl' in args:
        no_crawl = True
        args.remove('--no-crawl')
    if len(args) < 2:
        print("Usage: python download_js_pages.py [--no-crawl] <topic> <url1> [url2] ...")
        sys.exit(1)
    ensure_deps()
    topic = args[0]
    urls = args[1:]
    print(f"Topic: {topic}")
    print(f"URLs: {len(urls)}")
    print(f"Crawl linked pages: {not no_crawl}")
    # Group URLs by domain
    domains = {}
    for url in urls:
        domain = get_domain(url)
        if domain not in domains:
            domains[domain] = []
        domains[domain].append(url)
    results = []
    for domain, domain_urls in domains.items():
        output_dir = os.path.join('app', topic, 'downloads', domain)
        processed = set()
        to_process = list(domain_urls)
        while to_process:
            url = to_process.pop(0)
            if url in processed:
                continue
            processed.add(url)
            result = download_url(url, output_dir)
            if result:
                results.append(result)
                if not no_crawl:
                    # Get HTML again for links (or cache it)
                    html = render_page(url)
                    if html:
                        links = extract_links(html, url)
                        for link in links:
                            if link not in processed and link not in to_process:
                                to_process.append(link)
        # Save metadata
        metadata = {
            'domain': domain,
            'topic': topic,
            'dateDownloaded': datetime.now().isoformat(),
            'files': [r for r in results if get_domain(r['url']) == domain]
        }
        metadata_path = os.path.join(output_dir, 'metadata.json')
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved metadata: {metadata_path}")
    print(f"\nCompleted! Downloaded {len(results)} pages.")

if __name__ == '__main__':
    main()
