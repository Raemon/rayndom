#!/usr/bin/env python3
import json
import re

def summarize_transcript(transcript_text, max_sentences=5):
    """Create a concise summary of the transcript"""
    # Split into sentences
    sentences = re.split(r'[.!?]+', transcript_text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    # Get key sentences (first few and any that seem important)
    summary_sentences = []
    
    # Always include the first sentence if it's substantial
    if sentences and len(sentences[0]) > 30:
        summary_sentences.append(sentences[0])
    
    # Look for key phrases that indicate main topics
    key_phrases = [
        'i am', 'i\'m', 'my name is', 'i work', 'i built', 'i created',
        'the goal', 'the purpose', 'we are', 'we built', 'we created',
        'this is', 'this tool', 'this project', 'the main', 'the key'
    ]
    
    # Find sentences with key phrases
    for sentence in sentences[1:]:
        if len(summary_sentences) >= max_sentences:
            break
        sentence_lower = sentence.lower()
        if any(phrase in sentence_lower for phrase in key_phrases):
            if sentence not in summary_sentences and len(sentence) > 30:
                summary_sentences.append(sentence)
    
    # Fill remaining slots with substantial sentences
    for sentence in sentences[1:]:
        if len(summary_sentences) >= max_sentences:
            break
        if sentence not in summary_sentences and len(sentence) > 50:
            summary_sentences.append(sentence)
    
    summary = '. '.join(summary_sentences[:max_sentences])
    if summary and not summary.endswith('.'):
        summary += '.'
    
    return summary

# Read transcripts
with open('transcripts.json', 'r') as f:
    transcripts = json.load(f)

summaries = []

for item in transcripts:
    video_id = item['video_id']
    url = item['url']
    
    if not item.get('success', False):
        summaries.append({
            'video_id': video_id,
            'url': url,
            'summary': f"Could not retrieve transcript: {item.get('error', 'Unknown error')}",
            'status': 'failed'
        })
        continue
    
    transcript_text = item['transcript']
    summary = summarize_transcript(transcript_text)
    
    # Extract key topics/themes
    word_count = len(transcript_text.split())
    
    summaries.append({
        'video_id': video_id,
        'url': url,
        'summary': summary,
        'word_count': word_count,
        'status': 'success'
    })

# Save summaries as JSON
with open('summaries.json', 'w') as f:
    json.dump(summaries, f, indent=2)

# Create markdown file with summaries
with open('transcript_summaries.md', 'w') as f:
    f.write("# YouTube Video Transcript Summaries\n\n")
    f.write(f"Source: https://aiforhumanreasoning.com/#fellowship\n\n")
    f.write(f"Total videos: {len(summaries)}\n")
    f.write(f"Successfully summarized: {sum(1 for s in summaries if s['status'] == 'success')}\n\n")
    f.write("---\n\n")
    
    for i, summary in enumerate(summaries, 1):
        f.write(f"## {i}. Video ID: {summary['video_id']}\n\n")
        f.write(f"**URL:** {summary['url']}\n\n")
        
        if summary['status'] == 'success':
            f.write(f"**Summary:**\n{summary['summary']}\n\n")
            f.write(f"**Transcript Length:** {summary['word_count']} words\n\n")
        else:
            f.write(f"**Status:** {summary['summary']}\n\n")
        
        f.write("---\n\n")

print(f"✓ Created summaries for {len(summaries)} videos")
print(f"✓ Markdown file: transcript_summaries.md")
print(f"✓ JSON file: summaries.json")
