#!/usr/bin/env python3
"""
Download URLs and crawl all same-domain links, saving content as markdown.

LLM USAGE:
    python download_url.py <topic> <url1> [url2] [url3] ...          # blocking
    python download_url.py --bg <topic> <url1> [url2] [url3] ...     # background (non-blocking)
    python download_url.py --include-files <topic> <url1> ...        # include all file types
    python download_url.py --js <topic> <url1> ...                   # use Playwright for JS-heavy pages
    python download_url.py --auto <topic> <url1> ...                 # auto-detect if JS rendering needed
    python download_url.py --no-crawl <topic> <url1> ...             # only download specified URLs, don't follow links
    
    Examples:
        python download_url.py "ai-safety-research" https://example.com/article
        python download_url.py --bg "ai-safety-research" https://example.com/article https://other.com/page
        python download_url.py --include-files "research" https://example.com  # downloads pdfs, images, etc
        python download_url.py --js "lesswrong" https://www.lesswrong.com/s/KfCjeconYRdFbMxsy
        python download_url.py --auto "research" https://example.com  # tries requests, falls back to Playwright
    
    This will:
    - Download each URL and crawl all same-domain links recursively
    - Convert HTML to markdown, preserve other file types as-is
    - Save to: downloads/<topic>/<domain>/*.md
    - Create metadata.json per domain with download info
    
    Use --bg when you want to continue other tasks while downloads run in parallel.
    Background logs saved to: downloads/<topic>/.logs/
    
    Use --js for JavaScript-heavy sites (React, Vue, Angular, etc.) that need browser rendering.
    Use --auto to automatically detect and retry with Playwright if content looks JS-rendered.

Dependencies: pip install requests beautifulsoup4 html2text
             For --js/--auto: pip install playwright && playwright install chromium
"""
import sys
import os
import json
import subprocess
import hashlib
import requests
from datetime import datetime
from urllib.parse import urlparse, urljoin, urlunparse
from bs4 import BeautifulSoup
import html2text
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# Extensions that are allowed to be downloaded by default (without --include-files flag)
ALLOWED_EXTENSIONS = {'.html', '.htm', '.md', None}  # None means no extension (e.g. /about)

def strip_query_params(url):
    """Remove query parameters from URL."""
    parsed = urlparse(url)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, '', ''))

def sanitize_filename(url):
    """Convert URL to filesystem-safe filename (max 200 chars), ignoring query params."""
    parsed = urlparse(url)
    path = parsed.path.rstrip('/') or 'index'
    path = path.replace('/', '_').replace('\\', '_')
    filename = re.sub(r'[^\w\-_.]', '', path)
    return filename[:200]

def get_domain(url):
    """Extract domain name from URL."""
    parsed = urlparse(url)
    return parsed.netloc or parsed.path.split('/')[0]

def get_url_extension(url):
    """Extract file extension from URL path, returns extension (with dot) or None."""
    parsed = urlparse(url)
    path = parsed.path
    if '.' in path:
        ext = os.path.splitext(path)[1]
        if ext and len(ext) > 1:
            return ext.lower()
    return None

def download_content(url):
    """Download content from URL, returns (content, is_binary, content_type)."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        content_type = response.headers.get('Content-Type', '').lower()
        url_ext = get_url_extension(url)
        text_extensions = {'.txt', '.md', '.json', '.xml', '.csv', '.html', '.htm', '.css', '.js'}
        if url_ext and url_ext in text_extensions:
            is_binary = False
        elif content_type.startswith('text/'):
            is_binary = False
        else:
            is_binary = True
        if is_binary:
            return (response.content, True, content_type)
        else:
            return (response.text, False, content_type)
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return (None, False, None)

def download_content_js(url, wait_seconds=3):
    """Download content using Playwright for JS-heavy pages, returns (content, is_binary, content_type)."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright not installed. Run: pip install playwright && playwright install chromium")
        return (None, False, None)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until='domcontentloaded', timeout=60000)
            page.wait_for_timeout(wait_seconds * 1000)
            html = page.content()
            browser.close()
            return (html, False, 'text/html')
    except Exception as e:
        print(f"Error downloading {url} with Playwright: {e}")
        return (None, False, None)

def looks_like_js_rendered(html):
    """Detect if HTML looks like it needs JavaScript rendering.
    Returns True if the page appears to be a JS-heavy SPA with little static content."""
    if not html:
        return False
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.find('body')
    if not body:
        return True  # No body tag is suspicious
    # Remove script/style tags for text analysis
    for tag in body.find_all(['script', 'style', 'noscript']):
        tag.decompose()
    text = body.get_text(strip=True)
    # Heuristic 1: Very little text content (< 300 chars after stripping JS/CSS)
    if len(text) < 300:
        return True
    # Heuristic 2: Common SPA markers
    html_lower = html.lower()
    spa_markers = [
        'id="root"',  # React
        'id="app"',   # Vue
        'id="__next"', # Next.js
        'data-reactroot',
        'ng-app',     # Angular
        '__nuxt__',   # Nuxt
        'data-server-rendered',
    ]
    root_divs = soup.find_all('div', id=lambda x: x in ['root', 'app', '__next'])
    for marker in spa_markers:
        if marker in html_lower:
            # Check if the marker div has almost no content
            for div in root_divs:
                div_text = div.get_text(strip=True)
                if len(div_text) < 100:
                    return True
    return False

def extract_links(html, base_url):
    """Extract all same-domain links from HTML, normalized (no fragments or query params)."""
    soup = BeautifulSoup(html, 'html.parser')
    links = set()
    parsed_base = urlparse(base_url)
    for tag in soup.find_all('a', href=True):
        href = tag['href']
        absolute_url = urljoin(base_url, href)
        parsed = urlparse(absolute_url)
        if parsed.scheme in ('http', 'https') and parsed.netloc == parsed_base.netloc:
            normalized = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, '', ''))
            links.add(normalized)
    return list(links)

def html_to_markdown(html):
    """Convert HTML body to markdown, stripping images and nav elements."""
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.find('body')
    if not body:
        return ""
    # Remove all <nav> elements and their contents
    for nav in body.find_all('nav'):
        nav.decompose()
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = False
    h.body_width = 0
    markdown = h.handle(str(body))
    return markdown

def process_url(url, processed_urls, processed_urls_lock, base_domain, conversation_topic, include_files=False, use_js=False, auto_detect=False):
    """Process single URL: download, save (as .md for HTML, original ext otherwise), return discovered links."""
    domain = get_domain(url)
    url_ext = get_url_extension(url)
    # Skip URLs with file extensions unless they're allowed or --include-files is set
    if not include_files and url_ext not in ALLOWED_EXTENSIONS:
        print(f"Skipping (file extension {url_ext}): {url}")
        return ([], None, domain)
    with processed_urls_lock:
        if domain not in processed_urls:
            processed_urls[domain] = set()
        if url in processed_urls[domain]:
            return ([], None, domain)
        processed_urls[domain].add(url)
    print(f"Processing: {url}")
    # Choose download method based on flags
    if use_js:
        content, is_binary, content_type = download_content_js(url)
    else:
        content, is_binary, content_type = download_content(url)
        # Auto-detect: if content looks JS-rendered, retry with Playwright
        if auto_detect and content and not is_binary and looks_like_js_rendered(content):
            print(f"  Auto-detected JS-heavy page, retrying with Playwright...")
            content, is_binary, content_type = download_content_js(url)
    if content is None:
        return ([], None, domain)
    domain_dir = os.path.join('downloads', conversation_topic, domain)
    os.makedirs(domain_dir, exist_ok=True)
    filename_base = sanitize_filename(url)
    url_ext = get_url_extension(url)
    # Non-HTML files: save with original extension
    if url_ext and url_ext not in {'.html', '.htm'}:
        file_path = os.path.join(domain_dir, f"{filename_base}{url_ext}")
        if is_binary:
            with open(file_path, 'wb') as f:
                f.write(content)
        else:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        print(f"  Saved: {file_path}")
        saved_filename = f"{filename_base}{url_ext}"
        return ([], saved_filename, domain)
    # HTML content: convert to markdown
    html = content
    markdown = html_to_markdown(html)
    markdown_path = os.path.join(domain_dir, f"{filename_base}.md")
    with open(markdown_path, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"  Saved Markdown: {markdown_path}")
    links = extract_links(html, url)
    print(f"  Found {len(links)} links")
    saved_filename = f"{filename_base}.md"
    return (links, saved_filename, domain)

def process_domain(start_url, conversation_topic, processed_urls, processed_urls_lock, include_files=False, use_js=False, auto_detect=False, no_crawl=False):
    """Crawl a domain starting from URL, processing all same-domain links recursively."""
    base_domain = get_domain(start_url)
    url_file_map = {}  # Maps URL -> filename
    with processed_urls_lock:
        if base_domain not in processed_urls:
            processed_urls[base_domain] = set()
    urls_to_process = [start_url]
    while urls_to_process:
        current_url = urls_to_process.pop(0)
        new_links, saved_filename, domain = process_url(
            current_url, processed_urls, processed_urls_lock, base_domain, conversation_topic, include_files, use_js, auto_detect
        )
        if saved_filename:
            url_file_map[current_url] = saved_filename
        if no_crawl:
            continue  # Don't follow links
        with processed_urls_lock:
            domain_set = processed_urls.get(base_domain, set())
            for link in new_links:
                link_domain = get_domain(link)
                if link_domain == base_domain and link not in domain_set:
                    urls_to_process.append(link)
    with processed_urls_lock:
        all_urls = list(processed_urls[base_domain])
    main_file = url_file_map.get(start_url)
    other_url_files = [{"url": url, "file": url_file_map[url]} for url in all_urls if url != start_url and url in url_file_map]
    return {
        "domain": base_domain,
        "mainUrl": {"url": start_url, "file": main_file},
        "otherUrls": other_url_files,
        "allUrls": all_urls
    }

def run_in_background(conversation_topic, urls, include_files=False, use_js=False, auto_detect=False, no_crawl=False):
    """Re-launch this script as a background process without --bg flag."""
    # Strip query params and deduplicate before spawning background process
    urls = list(dict.fromkeys(strip_query_params(url) for url in urls))
    script_path = os.path.abspath(__file__)
    cmd = [sys.executable, script_path]
    if include_files:
        cmd.append('--include-files')
    if use_js:
        cmd.append('--js')
    if auto_detect:
        cmd.append('--auto')
    if no_crawl:
        cmd.append('--no-crawl')
    cmd.extend([conversation_topic] + urls)
    if os.name == 'nt':  # Windows
        subprocess.Popen(cmd, creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:  # Unix-like (macOS, Linux)
        log_dir = os.path.join('downloads', conversation_topic, '.logs')
        os.makedirs(log_dir, exist_ok=True)
        url_hash = hashlib.md5(' '.join(urls).encode()).hexdigest()[:8]
        log_file = os.path.join(log_dir, f'download_{url_hash}.log')
        with open(log_file, 'w') as log:
            subprocess.Popen(cmd, stdout=log, stderr=log, start_new_session=True)
    print(f"Started background download for {len(urls)} URL(s) in topic '{conversation_topic}'")
    print(f"Downloads will be saved to: downloads/{conversation_topic}/")

def run_download(conversation_topic, start_urls, include_files=False, use_js=False, auto_detect=False, no_crawl=False):
    """Main download logic: process all URLs in parallel, save results."""
    # Strip query params and deduplicate input URLs
    normalized_urls = list(dict.fromkeys(strip_query_params(url) for url in start_urls))
    if len(normalized_urls) < len(start_urls):
        print(f"Deduplicated {len(start_urls)} URLs to {len(normalized_urls)} (stripped query params)")
    start_urls = normalized_urls
    print(f"Processing {len(start_urls)} URL(s) in parallel...")
    print(f"Conversation topic: {conversation_topic}")
    if not include_files:
        print("Skipping file downloads (use --include-files to download pdfs, images, etc)")
    if use_js:
        print("Using Playwright for JavaScript rendering")
    elif auto_detect:
        print("Auto-detecting JS-heavy pages (will retry with Playwright if needed)")
    if no_crawl:
        print("Not following links (--no-crawl)")
    processed_urls = {}
    processed_urls_lock = Lock()
    domain_results = []
    with ThreadPoolExecutor(max_workers=min(len(start_urls), 10)) as executor:
        future_to_url = {
            executor.submit(process_domain, url, conversation_topic, processed_urls, processed_urls_lock, include_files, use_js, auto_detect, no_crawl): url
            for url in start_urls
        }
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                result = future.result()
                domain_results.append(result)
                print(f"\nCompleted domain {result['domain']}: processed {len(result['allUrls'])} URLs")
            except Exception as e:
                print(f"\nError processing {url}: {e}")
    # Save metadata.json per domain
    for result in domain_results:
        domain = result['domain']
        if not result['mainUrl']['file'] and not result['otherUrls']:
            print(f"Skipping metadata for {domain}: no files downloaded")
            continue
        metadata = [{
            "siteName": domain,
            "mainUrl": result['mainUrl'],
            "otherUrls": result['otherUrls'],
            "dateDownloaded": datetime.now().isoformat()
        }]
        domain_dir = os.path.join('downloads', conversation_topic, domain)
        os.makedirs(domain_dir, exist_ok=True)
        metadata_path = os.path.join(domain_dir, 'metadata.json')
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved metadata: {metadata_path}")
    total_urls = sum(len(r['allUrls']) for r in domain_results)
    print(f"\nCompleted! Processed {total_urls} URLs across {len(domain_results)} domain(s)")

def main():
    args = sys.argv[1:]
    # Check for flags
    background = False
    include_files = False
    use_js = False
    auto_detect = False
    no_crawl = False
    while args and args[0].startswith('--'):
        if args[0] == '--bg':
            background = True
            args = args[1:]
        elif args[0] == '--include-files':
            include_files = True
            args = args[1:]
        elif args[0] == '--js':
            use_js = True
            args = args[1:]
        elif args[0] == '--auto':
            auto_detect = True
            args = args[1:]
        elif args[0] == '--no-crawl':
            no_crawl = True
            args = args[1:]
        else:
            break
    if len(args) < 2:
        print("Usage: python download_url.py [--bg] [--include-files] [--js] [--auto] [--no-crawl] <topic> <url1> [url2] [url3] ...")
        print("  --bg             Run in background (non-blocking)")
        print("  --include-files  Download all file types (pdfs, images, etc)")
        print("  --js             Use Playwright for JS-heavy pages (React, Vue, etc)")
        print("  --auto           Auto-detect JS pages and retry with Playwright if needed")
        print("  --no-crawl       Only download specified URLs, don't follow links")
        print("Example: python download_url.py --bg 'research-topic' https://example.com/page1")
        print("Example: python download_url.py --js 'lesswrong' https://www.lesswrong.com/posts/...")
        sys.exit(1)
    conversation_topic = args[0]
    urls = args[1:]
    if background:
        run_in_background(conversation_topic, urls, include_files, use_js, auto_detect, no_crawl)
    else:
        run_download(conversation_topic, urls, include_files, use_js, auto_detect, no_crawl)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nDownload interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
