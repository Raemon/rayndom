# scrape-deeper

For any url or description of how to find a url in the rest of my request, generate a short conversation topic name (e.g., "competitor-analysis", "product-docs") that describes the purpose of downloading these URLs, and then use python3 to run the tools/download_url.py script with the --recurse-one flag to download the url(s) and follow links one level deep, saving them in the /downloads/[conversationtopic]/[websitedomainname] folder in the current directory.

The script supports multiple URLs and processes them in parallel for efficient batch downloading. When you find multiple relevant URLs during web search, you can pass them all at once:
    python tools/download_url.py --recurse-one <conversationtopic> <url1> <url2> <url3> ...

Each URL will be processed independently, downloading the top-level page and following links found on that page one level deep. Different domains are handled separately and saved in their own subdirectories.

The conversation topic should be a short, descriptive identifier that groups related downloads together (e.g., use kebab-case or lowercase with hyphens).

HOW TO USE DURING WEB SEARCH (PARALLEL OPTIMIZATION):
To maximize efficiency, run downloads in the background while continuing to search:

1. Perform first web search to find relevant URLs
2. Generate a descriptive conversation topic name
3. Start download script in BACKGROUND: python tools/download_url.py --bg --recurse-one <topic> <url1> <url2> ... (use is_background=true)
4. IMMEDIATELY perform another web search (don't wait for download to finish)
5. If new URLs are found and relevant, start another background instance: python tools/download_url.py --bg --recurse-one <topic> <url3> <url4> ...
6. Continue searching and starting new background downloads until search results are clearly not relevant
7. All downloads run in parallel, saving time by overlapping search and download operations

The key optimization: Use is_background=true when running the Python script so you can continue searching while downloads happen in parallel. Multiple instances of the script can run simultaneously for the same topic - they will all save to the same directory structure.

TRADITIONAL SEQUENTIAL APPROACH (if you prefer to wait):
1. Perform web searches to find relevant URLs
2. Collect all URLs that are relevant to the research topic
3. Generate a descriptive conversation topic name
4. Run: python tools/download_url.py --recurse-one <topic> <url1> <url2> ...
5. The script downloads all URLs in parallel, each downloading the top-level page and following links one level deep
6. HTML content is converted to markdown and saved as .md files; files with extensions (like .pdf, .txt) are saved with their original extension. All files can be read offline for analysis

Also run the tools/create_conversation_topic.py script to create the conversation topic folder and page components, if those don't already exist.
