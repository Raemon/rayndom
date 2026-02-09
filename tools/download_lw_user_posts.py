#!/usr/bin/env python3
"""
Download all LessWrong posts by a given user as markdown files.

Usage:
    python download_lw_user_posts.py <topic> <username>
    python download_lw_user_posts.py raemon-posts Raemon

This will:
    - Query the LessWrong GraphQL API for the user's ID
    - Fetch all posts by that user (paginated)
    - Save each post as a markdown file in downloads/<topic>/www.lesswrong.com/
    - Create metadata.json with download info
"""
import sys
import os
import json
import re
import requests
from datetime import datetime

LW_GRAPHQL_URL = "https://www.lesswrong.com/graphql"

def sanitize_filename(title):
    """Convert post title to filesystem-safe filename."""
    filename = re.sub(r'[^\w\s\-]', '', title)
    filename = re.sub(r'\s+', '-', filename.strip())
    return filename[:200]

def graphql_query(query, variables=None):
    """Execute a GraphQL query against the LessWrong API."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    headers = {"Content-Type": "application/json"}
    response = requests.post(LW_GRAPHQL_URL, json=payload, headers=headers, timeout=30)
    response.raise_for_status()
    data = response.json()
    if "errors" in data:
        print(f"GraphQL errors: {data['errors']}")
    return data.get("data", {})

def get_user_id(slug):
    """Get user ID from their slug/username."""
    query = """
    query getUserBySlug($slug: String) {
        user(input: {selector: {slug: $slug}}) {
            result {
                _id
                displayName
                slug
            }
        }
    }
    """
    data = graphql_query(query, {"slug": slug})
    user = data.get("user", {}).get("result")
    if not user:
        print(f"User '{slug}' not found")
        return None, None
    print(f"Found user: {user['displayName']} (ID: {user['_id']})")
    return user["_id"], user["displayName"]

def html_to_markdown(html):
    """Convert HTML to markdown."""
    try:
        import html2text
        h = html2text.HTML2Text()
        h.ignore_links = False
        h.ignore_images = False
        h.body_width = 0
        return h.handle(html)
    except ImportError:
        print("html2text not installed, saving raw HTML")
        return html

def fetch_all_posts(user_id):
    """Fetch all posts by a user, paginating through results."""
    all_posts = []
    offset = 0
    batch_size = 100
    while True:
        query = """
        query getPostsByUser($userId: String, $limit: Int, $offset: Int) {
            posts(input: {terms: {userId: $userId, limit: $limit, offset: $offset}}) {
                results {
                    _id
                    title
                    slug
                    htmlBody
                    postedAt
                    baseScore
                    voteCount
                    commentCount
                    url
                }
                totalCount
            }
        }
        """
        variables = {"userId": user_id, "limit": batch_size, "offset": offset}
        data = graphql_query(query, variables)
        posts_data = data.get("posts", {})
        results = posts_data.get("results", [])
        if not results:
            break
        all_posts.extend(results)
        print(f"  Fetched {len(all_posts)} posts so far...")
        if len(results) < batch_size:
            break
        offset += batch_size
    return all_posts

def save_posts(posts, topic, display_name):
    """Save all posts as markdown files."""
    domain_dir = os.path.join("downloads", topic, "www.lesswrong.com")
    os.makedirs(domain_dir, exist_ok=True)
    saved_files = []
    skipped = 0
    for post in posts:
        title = post.get("title", "Untitled")
        html_body = post.get("htmlBody", "")
        if not html_body:
            skipped += 1
            continue
        slug = post.get("slug", "")
        posted_at = post.get("postedAt", "")
        base_score = post.get("baseScore", 0)
        vote_count = post.get("voteCount", 0)
        comment_count = post.get("commentCount", 0)
        # Convert HTML to markdown
        markdown_body = html_to_markdown(html_body)
        # Build full markdown with title header
        date_str = posted_at[:10] if posted_at else "unknown"
        header = f"# {title}\n\n"
        header += f"*Posted: {date_str} | Score: {base_score} | Comments: {comment_count}*\n\n"
        header += f"*URL: https://www.lesswrong.com/posts/{post['_id']}/{slug}*\n\n---\n\n"
        full_markdown = header + markdown_body
        filename = sanitize_filename(title) + ".md"
        filepath = os.path.join(domain_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(full_markdown)
        saved_files.append({
            "title": title,
            "file": filename,
            "url": f"https://www.lesswrong.com/posts/{post['_id']}/{slug}",
            "postedAt": posted_at,
            "baseScore": base_score,
            "commentCount": comment_count
        })
    # Save metadata
    metadata = [{
        "siteName": "www.lesswrong.com",
        "mainUrl": {"url": f"https://www.lesswrong.com/users/{display_name}", "file": None},
        "otherUrls": [{"url": f["url"], "file": f["file"]} for f in saved_files],
        "dateDownloaded": datetime.now().isoformat(),
        "totalPosts": len(saved_files)
    }]
    metadata_path = os.path.join(domain_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    return saved_files, skipped

def main():
    if len(sys.argv) < 3:
        print("Usage: python download_lw_user_posts.py <topic> <username>")
        print("Example: python download_lw_user_posts.py raemon-posts Raemon")
        sys.exit(1)
    topic = sys.argv[1]
    username = sys.argv[2]
    print(f"Fetching posts by '{username}' into topic '{topic}'...")
    user_id, display_name = get_user_id(username)
    if not user_id:
        sys.exit(1)
    print(f"\nFetching all posts by {display_name}...")
    posts = fetch_all_posts(user_id)
    print(f"\nFound {len(posts)} total posts")
    print(f"\nSaving posts as markdown files...")
    saved, skipped = save_posts(posts, topic, display_name)
    print(f"\nDone! Saved {len(saved)} posts, skipped {skipped} (no body)")
    print(f"Files saved to: downloads/{topic}/www.lesswrong.com/")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
