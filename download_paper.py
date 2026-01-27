#!/usr/bin/env python3
"""
Download a paper from Sci-Hub or SciDB using a DOI, checking availability via Anna's Archive.
"""
import sys
import os
import requests
from bs4 import BeautifulSoup
import re
import time

def search_annas_archive(doi):
    """
    Search Anna's Archive for a paper by DOI and find Sci-Hub/SciDB links.
    
    Args:
        doi: The DOI of the paper (e.g., "10.3390/cells8101139")
    
    Returns:
        dict with 'scihub' and 'scidb' keys containing download URLs, or None if not found
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # Search Anna's Archive for the DOI
    search_url = "https://annas-archive.org/search"
    params = {'q': doi}
    
    try:
        print(f"Searching Anna's Archive for DOI: {doi}...")
        response = requests.get(search_url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all result items
        results = {}
        
        # Look for links to Sci-Hub and SciDB
        # Anna's Archive typically shows source links in the results
        # Look for links containing 'sci-hub' or 'scidb' in href or text
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            text = link.get_text().lower()
            
            # Check for Sci-Hub links
            if 'sci-hub' in href.lower() or 'sci-hub' in text:
                if href.startswith('http'):
                    results['scihub'] = href
                elif href.startswith('/'):
                    results['scihub'] = 'https://annas-archive.org' + href
            
            # Check for SciDB links
            if 'scidb' in href.lower() or 'scidb' in text:
                if href.startswith('http'):
                    results['scidb'] = href
                elif href.startswith('/'):
                    results['scidb'] = 'https://annas-archive.org' + href
        
        # Also check for direct paper links in the search results
        # Anna's Archive results often have direct links to papers
        result_items = soup.find_all(['div', 'article'], class_=re.compile(r'result|item|paper', re.I))
        
        for item in result_items:
            # Look for download links or source indicators
            item_links = item.find_all('a', href=True)
            for item_link in item_links:
                href = item_link.get('href', '')
                text = item_link.get_text().lower()
                
                # Check if this is a direct paper link
                if 'sci-hub' in href.lower() or 'sci-hub' in text:
                    if href.startswith('http'):
                        results['scihub'] = href
                    elif href.startswith('/'):
                        results['scihub'] = 'https://annas-archive.org' + href
                
                if 'scidb' in href.lower() or 'scidb' in text:
                    if href.startswith('http'):
                        results['scidb'] = href
                    elif href.startswith('/'):
                        results['scidb'] = 'https://annas-archive.org' + href
        
        # Alternative: Try direct Anna's Archive paper URL pattern
        # Sometimes papers are accessible via /md5/ or /doi/ patterns
        if not results:
            # Try to find any paper link that might lead to the paper
            paper_links = soup.find_all('a', href=re.compile(r'(md5|doi|paper)', re.I))
            for link in paper_links:
                href = link.get('href', '')
                if href.startswith('/'):
                    # This might be a paper page, check it for source links
                    paper_page_url = 'https://annas-archive.org' + href
                    try:
                        page_response = requests.get(paper_page_url, headers=headers, timeout=30)
                        page_soup = BeautifulSoup(page_response.content, 'html.parser')
                        
                        # Look for Sci-Hub and SciDB links on the paper page
                        source_links = page_soup.find_all('a', href=True)
                        for source_link in source_links:
                            source_href = source_link.get('href', '')
                            source_text = source_link.get_text().lower()
                            
                            if 'sci-hub' in source_href.lower() or 'sci-hub' in source_text:
                                if source_href.startswith('http'):
                                    results['scihub'] = source_href
                                elif source_href.startswith('/'):
                                    results['scihub'] = 'https://annas-archive.org' + source_href
                            
                            if 'scidb' in source_href.lower() or 'scidb' in source_text:
                                if source_href.startswith('http'):
                                    results['scidb'] = source_href
                                elif source_href.startswith('/'):
                                    results['scidb'] = 'https://annas-archive.org' + source_href
                        
                        if results:
                            break
                    except Exception as e:
                        print(f"Error checking paper page {paper_page_url}: {e}")
                        continue
        
        return results if results else None
        
    except Exception as e:
        print(f"Error searching Anna's Archive: {e}")
        return None

def download_from_scihub(doi, output_dir):
    """
    Download a paper from Sci-Hub using its DOI.
    
    Args:
        doi: The DOI of the paper
        output_dir: Directory where the PDF should be saved
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Sci-Hub domains (try multiple as they may change)
    scihub_domains = [
        'https://sci-hub.se',
        'https://sci-hub.st',
        'https://sci-hub.ru',
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    pdf_url = None
    
    # Try each Sci-Hub domain
    for domain in scihub_domains:
        try:
            url = f"{domain}/{doi}"
            print(f"Trying Sci-Hub: {url}...")
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for PDF in iframe
            iframe = soup.find('iframe', {'id': 'pdf'})
            if iframe and iframe.get('src'):
                pdf_url = iframe['src']
                # Make absolute URL if relative
                if pdf_url.startswith('//'):
                    pdf_url = 'https:' + pdf_url
                elif pdf_url.startswith('/'):
                    pdf_url = domain + pdf_url
                print(f"Found PDF URL in iframe: {pdf_url}")
                break
            
            # Look for direct PDF link
            pdf_link = soup.find('a', href=re.compile(r'\.pdf'))
            if pdf_link and pdf_link.get('href'):
                pdf_url = pdf_link['href']
                if pdf_url.startswith('//'):
                    pdf_url = 'https:' + pdf_url
                elif pdf_url.startswith('/'):
                    pdf_url = domain + pdf_url
                print(f"Found PDF URL in link: {pdf_url}")
                break
            
            # Look for embedded PDF object
            embed = soup.find('embed', {'type': 'application/pdf'})
            if embed and embed.get('src'):
                pdf_url = embed['src']
                if pdf_url.startswith('//'):
                    pdf_url = 'https:' + pdf_url
                elif pdf_url.startswith('/'):
                    pdf_url = domain + pdf_url
                print(f"Found PDF URL in embed: {pdf_url}")
                break
            
            # Try to find any PDF URL in the page
            pdf_pattern = re.compile(r'https?://[^\s"\'<>]+\.pdf', re.IGNORECASE)
            matches = pdf_pattern.findall(response.text)
            if matches:
                pdf_url = matches[0]
                print(f"Found PDF URL via regex: {pdf_url}")
                break
                
        except Exception as e:
            print(f"Error with {domain}: {e}")
            continue
    
    if not pdf_url:
        return False
    
    # Download the PDF
    return download_pdf(pdf_url, doi, output_dir, headers)

def download_from_scidb(doi, output_dir):
    """
    Download a paper from SciDB using its DOI.
    
    Args:
        doi: The DOI of the paper
        output_dir: Directory where the PDF should be saved
    
    Returns:
        bool: True if successful, False otherwise
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    # SciDB is accessible via Anna's Archive
    scidb_url = f"https://annas-archive.org/scidb/{doi}"
    
    try:
        print(f"Trying SciDB: {scidb_url}...")
        response = requests.get(scidb_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for PDF download links
        pdf_url = None
        
        # Check for direct PDF links
        pdf_links = soup.find_all('a', href=re.compile(r'\.pdf', re.I))
        for link in pdf_links:
            href = link.get('href', '')
            if href.startswith('http'):
                pdf_url = href
                break
            elif href.startswith('/'):
                pdf_url = 'https://annas-archive.org' + href
                break
        
        # Check for download buttons or links
        if not pdf_url:
            download_links = soup.find_all('a', class_=re.compile(r'download|pdf', re.I))
            for link in download_links:
                href = link.get('href', '')
                if href.startswith('http'):
                    pdf_url = href
                    break
                elif href.startswith('/'):
                    pdf_url = 'https://annas-archive.org' + href
                    break
        
        # Try to find PDF URL in page content
        if not pdf_url:
            pdf_pattern = re.compile(r'https?://[^\s"\'<>]+\.pdf', re.IGNORECASE)
            matches = pdf_pattern.findall(response.text)
            if matches:
                pdf_url = matches[0]
        
        if not pdf_url:
            return False
        
        print(f"Found PDF URL: {pdf_url}")
        return download_pdf(pdf_url, doi, output_dir, headers)
        
    except Exception as e:
        print(f"Error accessing SciDB: {e}")
        return False

def download_pdf(pdf_url, doi, output_dir, headers):
    """
    Download a PDF from a given URL.
    
    Args:
        pdf_url: URL of the PDF to download
        doi: The DOI of the paper (for filename)
        output_dir: Directory where the PDF should be saved
        headers: HTTP headers to use
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        print(f"Downloading PDF from {pdf_url}...")
        pdf_response = requests.get(pdf_url, headers=headers, timeout=60, stream=True)
        pdf_response.raise_for_status()
        
        # Check if it's actually a PDF
        content_type = pdf_response.headers.get('Content-Type', '').lower()
        if 'pdf' not in content_type and not pdf_url.lower().endswith('.pdf'):
            # Check first few bytes for PDF magic number
            first_chunk = next(pdf_response.iter_content(chunk_size=4), b'')
            if not first_chunk.startswith(b'%PDF'):
                print("Warning: Response does not appear to be a PDF file")
        
        # Generate filename from DOI
        filename = doi.replace('/', '_').replace(':', '_') + '.pdf'
        filepath = os.path.join(output_dir, filename)
        
        # Save the PDF
        with open(filepath, 'wb') as f:
            for chunk in pdf_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Successfully downloaded PDF to: {filepath}")
        return True
        
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return False

def download_paper(doi, output_dir):
    """
    Download a paper by checking both Sci-Hub and SciDB via Anna's Archive.
    
    Args:
        doi: The DOI of the paper (e.g., "10.3390/cells8101139")
        output_dir: Directory where the PDF should be saved
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Checking availability for DOI: {doi}")
    print("=" * 60)
    
    # First, check Anna's Archive for availability
    sources = search_annas_archive(doi)
    
    if sources:
        print(f"\nFound sources on Anna's Archive:")
        if 'scihub' in sources:
            print(f"  - Sci-Hub: {sources['scihub']}")
        if 'scidb' in sources:
            print(f"  - SciDB: {sources['scidb']}")
        print()
    
    # Try Sci-Hub first
    print("Attempting download from Sci-Hub...")
    if download_from_scihub(doi, output_dir):
        return True
    
    print("\nSci-Hub download failed. Trying SciDB...")
    
    # Try SciDB
    if download_from_scidb(doi, output_dir):
        return True
    
    print("\nBoth Sci-Hub and SciDB downloads failed.")
    print("The paper may not be available in either source.")
    return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python download_paper.py <DOI> <output_dir>")
        print("Example: python download_paper.py 10.3390/cells8101139 downloads/ketamine-in-vitro-safety")
        sys.exit(1)
    
    doi = sys.argv[1]
    output_dir = sys.argv[2]
    
    success = download_paper(doi, output_dir)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
