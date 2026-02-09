#!/usr/bin/env python3
"""
Generic batch web search tool. Expands query templates across variable ranges,
searches the web, and downloads results via download_url.py.

Use this when you want to systematically research a topic by searching for many
variations of a query (e.g. the same search across every year, or across a list
of related terms). It uses DuckDuckGo to search, then pipes the found URLs
through download_url.py to save the page content locally. Supports resuming
interrupted runs, batching with delays to avoid rate-limiting, and deduplication
of downloaded pages.

LLM USAGE:
    # Config-driven (for large systematic searches):
    python tools/batch_search.py --config path/to/config.json
    python tools/batch_search.py --config path/to/config.json --resume
    python tools/batch_search.py --config path/to/config.json --dry-run

    # Inline args (for quick one-off searches):
    python tools/batch_search.py --topic my-topic --query "{x} search term" --range x=1,100
    python tools/batch_search.py --topic my-topic --query "{x} term" --list x=foo,bar,baz
    python tools/batch_search.py --topic my-topic --query "{year} {term}" --range year=2000,2026 --list term="executive overreach,presidential power"

    Config JSON format:
    {
      "topic": "my-topic",
      "queries": ["{year} executive overreach", "{year} presidential power"],
      "variables": {
        "year": {"type": "range", "start": 2000, "end": 2026}
      },
      "subtopic_template": "{year}",
      "max_results_per_query": 10,
      "batch_size": 5,
      "delay_between_batches_seconds": 10,
      "download_args": []
    }

    Variable types:
      - range: {"type": "range", "start": N, "end": M}
      - list:  {"type": "list", "values": ["a", "b", "c"]}
    Multiple variables are cartesian-producted.

    Saves progress to downloads/<topic>/.search_progress.json for --resume.
    Saves raw search results to downloads/<topic>/.search_results/<subtopic>.json.
    Downloads via download_url.py --bg --subtopic, exactly like /scrape-urls.

Dependencies: pip install ddgs
"""
import sys
import os
import json
import time
import argparse
import subprocess
import itertools
from datetime import datetime
from pathlib import Path

def expand_variables(variables):
    """Expand variable definitions into lists of (name, values) pairs."""
    expanded = {}
    for name, spec in variables.items():
        if spec["type"] == "range":
            expanded[name] = [str(i) for i in range(spec["start"], spec["end"] + 1)]
        elif spec["type"] == "list":
            expanded[name] = spec["values"]
        else:
            raise ValueError(f"Unknown variable type: {spec['type']}")
    return expanded

def expand_queries(query_templates, variables):
    """Expand query templates across all variable combinations.
    Returns list of (query_string, variable_dict) tuples."""
    if not variables:
        return [(q, {}) for q in query_templates]
    expanded_vars = expand_variables(variables)
    var_names = list(expanded_vars.keys())
    var_values = [expanded_vars[n] for n in var_names]
    results = []
    for combo in itertools.product(*var_values):
        var_dict = dict(zip(var_names, combo))
        for template in query_templates:
            query = template
            for name, value in var_dict.items():
                query = query.replace(f"{{{name}}}", value)
            results.append((query, var_dict))
    return results

def get_subtopic(subtopic_template, var_dict):
    """Expand subtopic template with variables."""
    if not subtopic_template:
        return None
    result = subtopic_template
    for name, value in var_dict.items():
        result = result.replace(f"{{{name}}}", value)
    return result

def extract_search_terms(query):
    """Extract meaningful search terms from query, removing operators and quotes."""
    import re
    # Remove quoted phrases (keep the content)
    query = re.sub(r'"([^"]+)"', r'\1', query)
    # Split on spaces and filter out operators and short words
    terms = []
    skip_words = {'or', 'and', 'not', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with'}
    for word in query.lower().split():
        word = word.strip('.,!?;:()[]{}')
        if len(word) > 2 and word not in skip_words:
            terms.append(word)
    return terms

def result_contains_terms(result, terms):
    """Check if a search result contains all required terms (in title, body, or URL)."""
    text = ' '.join([
        result.get('title', ''),
        result.get('body', ''),
        result.get('href', '')
    ]).lower()
    for term in terms:
        if term not in text:
            return False
    return True

def search_ddg(query, max_results=10, strict_filter=True):
    """Search DuckDuckGo and return list of {title, href, body}.
    If strict_filter=True, only returns results containing all search terms."""
    try:
        from ddgs import DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            print("ERROR: ddgs not installed. Run: pip install ddgs")
            sys.exit(1)
    try:
        results = list(DDGS().text(query, max_results=max_results * 2 if strict_filter else max_results))
        if strict_filter:
            terms = extract_search_terms(query)
            if terms:
                filtered = [r for r in results if result_contains_terms(r, terms)]
                return filtered[:max_results]
        return results[:max_results]
    except Exception as e:
        print(f"  Search error for '{query}': {e}")
        return []

def load_progress(progress_path):
    """Load search progress from file."""
    if os.path.exists(progress_path):
        with open(progress_path, 'r') as f:
            return json.load(f)
    return {"completed_queries": [], "total_urls_found": 0, "total_urls_downloaded": 0}

def save_progress(progress_path, progress):
    """Save search progress to file."""
    os.makedirs(os.path.dirname(progress_path), exist_ok=True)
    with open(progress_path, 'w') as f:
        json.dump(progress, f, indent=2)

def save_search_results(results_dir, subtopic, results):
    """Save raw search results for a subtopic."""
    os.makedirs(results_dir, exist_ok=True)
    key = subtopic or "_default"
    results_path = os.path.join(results_dir, f"{key}.json")
    existing = []
    if os.path.exists(results_path):
        with open(results_path, 'r') as f:
            existing = json.load(f)
    existing.extend(results)
    with open(results_path, 'w') as f:
        json.dump(existing, f, indent=2)

def download_urls(topic, urls, subtopic=None, download_args=None):
    """Call download_url.py to download URLs, matching /scrape-urls pattern."""
    if not urls:
        return
    script_dir = os.path.dirname(os.path.abspath(__file__))
    download_script = os.path.join(script_dir, 'download_url.py')
    cmd = [sys.executable, download_script, '--bg']
    if subtopic:
        cmd.extend(['--subtopic', subtopic])
    if download_args:
        cmd.extend(download_args)
    cmd.append(topic)
    cmd.extend(urls)
    print(f"  Downloading {len(urls)} URLs (subtopic={subtopic or 'none'})...")
    subprocess.run(cmd)

def run_batch_search(config, resume=False, dry_run=False):
    """Run the batch search pipeline."""
    topic = config["topic"]
    query_templates = config["queries"]
    variables = config.get("variables", {})
    subtopic_template = config.get("subtopic_template")
    max_results = config.get("max_results_per_query", 10)
    batch_size = config.get("batch_size", 5)
    delay = config.get("delay_between_batches_seconds", 10)
    download_args = config.get("download_args", [])
    strict_filter = config.get("strict_filter", True)
    # Expand all queries
    all_queries = expand_queries(query_templates, variables)
    print(f"Topic: {topic}")
    print(f"Total queries to run: {len(all_queries)}")
    print(f"Batch size: {batch_size}, delay: {delay}s")
    if dry_run:
        print(f"\n--- DRY RUN: showing first 20 of {len(all_queries)} queries ---")
        for i, (query, var_dict) in enumerate(all_queries[:20]):
            subtopic = get_subtopic(subtopic_template, var_dict)
            print(f"  [{i+1}] query=\"{query}\" subtopic={subtopic or 'none'}")
        if len(all_queries) > 20:
            print(f"  ... and {len(all_queries) - 20} more")
        return
    # Progress tracking
    downloads_dir = os.path.join('downloads', topic)
    progress_path = os.path.join(downloads_dir, '.search_progress.json')
    results_dir = os.path.join(downloads_dir, '.search_results')
    progress = load_progress(progress_path) if resume else {"completed_queries": [], "total_urls_found": 0, "total_urls_downloaded": 0}
    completed_set = set(progress["completed_queries"])
    # Filter out completed queries
    pending_queries = [(q, v) for q, v in all_queries if q not in completed_set]
    if resume:
        print(f"Resuming: {len(completed_set)} already completed, {len(pending_queries)} remaining")
    else:
        print(f"Starting fresh: {len(pending_queries)} queries to run")
    # Group queries by subtopic for efficient downloading
    batch_num = 0
    for i in range(0, len(pending_queries), batch_size):
        batch = pending_queries[i:i + batch_size]
        batch_num += 1
        print(f"\n=== Batch {batch_num} ({len(batch)} queries) ===")
        # Collect all URLs from this batch, grouped by subtopic
        subtopic_urls = {}
        for query, var_dict in batch:
            subtopic = get_subtopic(subtopic_template, var_dict)
            print(f"  Searching: {query}")
            results = search_ddg(query, max_results=max_results, strict_filter=strict_filter)
            urls = [r["href"] for r in results if "href" in r]
            if strict_filter and len(results) < max_results:
                print(f"    Found {len(urls)} results (filtered from {len(results)} raw results)")
            else:
                print(f"    Found {len(urls)} results")
            # Save raw results
            search_entries = [{"query": query, "variables": var_dict, "timestamp": datetime.now().isoformat(), "results": results}]
            save_search_results(results_dir, subtopic, search_entries)
            # Collect URLs by subtopic
            if subtopic not in subtopic_urls:
                subtopic_urls[subtopic] = set()
            subtopic_urls[subtopic].update(urls)
            # Mark completed
            progress["completed_queries"].append(query)
            progress["total_urls_found"] += len(urls)
        # Download URLs grouped by subtopic
        for subtopic, urls in subtopic_urls.items():
            url_list = list(urls)
            progress["total_urls_downloaded"] += len(url_list)
            download_urls(topic, url_list, subtopic=subtopic, download_args=download_args)
        # Save progress after each batch
        save_progress(progress_path, progress)
        print(f"  Progress: {len(progress['completed_queries'])}/{len(all_queries)} queries, {progress['total_urls_found']} URLs found, {progress['total_urls_downloaded']} downloads started")
        # Delay between batches (skip after last batch)
        if i + batch_size < len(pending_queries):
            print(f"  Waiting {delay}s before next batch...")
            time.sleep(delay)
    print(f"\n=== Search complete ===")
    print(f"Total queries: {len(progress['completed_queries'])}")
    print(f"Total URLs found: {progress['total_urls_found']}")
    print(f"Total downloads started: {progress['total_urls_downloaded']}")
    print(f"Progress saved to: {progress_path}")
    print(f"Search results saved to: {results_dir}/")
    # Wait for background downloads to finish, then deduplicate
    print(f"\nWaiting 30s for background downloads to finish...")
    time.sleep(30)
    print(f"Running deduplication...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dedup_script = os.path.join(script_dir, 'dedup_downloads.py')
    subprocess.run([sys.executable, dedup_script, topic])

def parse_inline_variable(spec):
    """Parse inline variable spec like 'year=1789,2026' into (name, definition)."""
    name, values = spec.split('=', 1)
    return name.strip(), values.strip()

def main():
    parser = argparse.ArgumentParser(description='Generic batch web search tool')
    parser.add_argument('--config', help='Path to search config JSON file')
    parser.add_argument('--topic', help='Conversation topic (for inline mode)')
    parser.add_argument('--query', action='append', help='Query template (repeatable, for inline mode)')
    parser.add_argument('--range', action='append', help='Range variable: name=start,end (repeatable)')
    parser.add_argument('--list', action='append', help='List variable: name=val1,val2,val3 (repeatable)')
    parser.add_argument('--subtopic-template', help='Subtopic template string')
    parser.add_argument('--batch-size', type=int, default=5, help='Queries per batch (default: 5)')
    parser.add_argument('--delay', type=int, default=10, help='Seconds between batches (default: 10)')
    parser.add_argument('--max-results', type=int, default=10, help='Max results per query (default: 10)')
    parser.add_argument('--resume', action='store_true', help='Resume from saved progress')
    parser.add_argument('--dry-run', action='store_true', help='Print queries without searching')
    parser.add_argument('--download-args', nargs='*', default=[], help='Extra args to pass to download_url.py')
    args = parser.parse_args()
    if args.config:
        with open(args.config, 'r') as f:
            config = json.load(f)
        # CLI overrides
        if args.batch_size != 5:
            config["batch_size"] = args.batch_size
        if args.delay != 10:
            config["delay_between_batches_seconds"] = args.delay
        if args.max_results != 10:
            config["max_results_per_query"] = args.max_results
    elif args.topic and args.query:
        # Build config from inline args
        variables = {}
        if args.range:
            for spec in args.range:
                name, values = parse_inline_variable(spec)
                start, end = values.split(',')
                variables[name] = {"type": "range", "start": int(start), "end": int(end)}
        if args.list:
            for spec in args.list:
                name, values = parse_inline_variable(spec)
                variables[name] = {"type": "list", "values": [v.strip() for v in values.split(',')]}
        config = {
            "topic": args.topic,
            "queries": args.query,
            "variables": variables,
            "subtopic_template": args.subtopic_template,
            "max_results_per_query": args.max_results,
            "batch_size": args.batch_size,
            "delay_between_batches_seconds": args.delay,
            "download_args": args.download_args,
        }
    else:
        parser.error("Either --config or (--topic + --query) are required")
    # Optionally save config for future --resume
    if not args.config and not args.dry_run:
        config_dir = os.path.join('downloads', config['topic'])
        os.makedirs(config_dir, exist_ok=True)
        config_path = os.path.join(config_dir, '.search_config.json')
        if not os.path.exists(config_path):
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            print(f"Saved config to: {config_path}")
    run_batch_search(config, resume=args.resume, dry_run=args.dry_run)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSearch interrupted by user. Use --resume to continue.")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
