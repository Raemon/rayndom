#!/usr/bin/env python3
import json
import os

# Read transcripts
with open('transcripts.json', 'r') as f:
    transcripts = json.load(f)

summaries = []

for item in transcripts:
    if not item.get('success', False):
        summaries.append({
            'video_id': item['video_id'],
            'url': item['url'],
            'summary': f"Could not retrieve transcript: {item.get('error', 'Unknown error')}",
            'status': 'failed'
        })
        continue
    
    transcript_text = item['transcript']
    
    # Create a summary using a simple approach - first few sentences and key points
    # For a more sophisticated summary, we could use an LLM API, but for now
    # let's create a structured summary file that we can enhance
    
    # Extract first 500 characters as a preview
    preview = transcript_text[:500] + "..." if len(transcript_text) > 500 else transcript_text
    
    # Count words
    word_count = len(transcript_text.split())
    
    summaries.append({
        'video_id': item['video_id'],
        'url': item['url'],
        'preview': preview,
        'word_count': word_count,
        'full_transcript': transcript_text,
        'status': 'success'
    })

# Save summaries
with open('summaries.json', 'w') as f:
    json.dump(summaries, f, indent=2)

# Also create a markdown file with summaries
with open('transcript_summaries.md', 'w') as f:
    f.write("# YouTube Video Transcript Summaries\n\n")
    f.write(f"From: https://aiforhumanreasoning.com/#fellowship\n\n")
    f.write(f"Total videos processed: {len(summaries)}\n")
    f.write(f"Successfully retrieved: {sum(1 for s in summaries if s['status'] == 'success')}\n\n")
    f.write("---\n\n")
    
    for summary in summaries:
        f.write(f"## Video: {summary['video_id']}\n\n")
        f.write(f"**URL:** {summary['url']}\n\n")
        
        if summary['status'] == 'success':
            f.write(f"**Word Count:** {summary['word_count']}\n\n")
            f.write(f"**Preview:**\n{summary['preview']}\n\n")
            f.write(f"**Full Transcript:**\n{summary['full_transcript']}\n\n")
        else:
            f.write(f"**Status:** {summary['summary']}\n\n")
        
        f.write("---\n\n")

print(f"Created summaries for {len(summaries)} videos")
print(f"Markdown file: transcript_summaries.md")
print(f"JSON file: summaries.json")
