#!/usr/bin/env python3
import json
import re

def create_detailed_summary(transcript_text):
    """Create a detailed summary by analyzing the transcript content"""
    
    # Clean up the transcript
    text = transcript_text.replace('um', '').replace('uh', '')
    text = re.sub(r'\s+', ' ', text)
    
    # Extract speaker introduction
    intro_patterns = [
        r"i am ([^\.]+)",
        r"i'm ([^\.]+)",
        r"my name is ([^\.]+)",
        r"i'm ([^\.]+), ([^\.]+)"
    ]
    
    speaker_info = ""
    for pattern in intro_patterns:
        match = re.search(pattern, text.lower())
        if match:
            speaker_info = match.group(0)
            break
    
    # Extract project/tool name
    project_patterns = [
        r"(?:i'm|i am|we're|we are) (?:working on|building|creating|developing) ([^\.]+)",
        r"(?:this is|it's) (?:called|named) ([^\.]+)",
        r"([A-Z][a-z]+) (?:is|was) (?:a|an) ([^\.]+)"
    ]
    
    # Extract main topic/thesis
    thesis_patterns = [
        r"the (?:goal|purpose|aim|idea) (?:is|was) (?:to )?([^\.]+)",
        r"i (?:want|am trying|am working) (?:to )?([^\.]+)",
        r"we (?:are|want) (?:to )?([^\.]+)"
    ]
    
    # Find key sentences about what they built/are doing
    sentences = re.split(r'[.!?]+', text)
    key_sentences = []
    
    # Look for sentences that describe the project
    keywords = ['build', 'create', 'develop', 'tool', 'system', 'project', 'platform', 
                'solution', 'approach', 'method', 'framework', 'technology']
    
    for sentence in sentences:
        sentence_clean = sentence.strip()
        if len(sentence_clean) > 30:
            sentence_lower = sentence_clean.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                if len(key_sentences) < 3:
                    key_sentences.append(sentence_clean)
    
    # Create summary
    summary_parts = []
    
    if speaker_info:
        summary_parts.append(f"Speaker: {speaker_info.capitalize()}")
    
    if key_sentences:
        summary_parts.append(" ".join(key_sentences[:2]))
    
    # If we don't have enough, add first substantial sentence
    if len(summary_parts) < 2 and sentences:
        first_substantial = next((s.strip() for s in sentences if len(s.strip()) > 50), None)
        if first_substantial:
            summary_parts.append(first_substantial)
    
    summary = ". ".join(summary_parts)
    if summary and not summary.endswith('.'):
        summary += "."
    
    return summary

# Read transcripts
with open('transcripts.json', 'r') as f:
    transcripts = json.load(f)

detailed_summaries = []

for item in transcripts:
    video_id = item['video_id']
    url = item['url']
    
    if not item.get('success', False):
        detailed_summaries.append({
            'video_id': video_id,
            'url': url,
            'summary': f"Could not retrieve transcript: {item.get('error', 'Unknown error')}",
            'status': 'failed'
        })
        continue
    
    transcript_text = item['transcript']
    summary = create_detailed_summary(transcript_text)
    
    word_count = len(transcript_text.split())
    
    detailed_summaries.append({
        'video_id': video_id,
        'url': url,
        'summary': summary,
        'word_count': word_count,
        'status': 'success'
    })

# Create final markdown with better summaries
with open('FINAL_transcript_summaries.md', 'w') as f:
    f.write("# YouTube Video Transcript Summaries\n\n")
    f.write(f"**Source:** https://aiforhumanreasoning.com/#fellowship\n\n")
    f.write(f"**Total videos:** {len(detailed_summaries)}\n")
    f.write(f"**Successfully summarized:** {sum(1 for s in detailed_summaries if s['status'] == 'success')}\n\n")
    f.write("---\n\n")
    
    for i, summary in enumerate(detailed_summaries, 1):
        f.write(f"## {i}. Video: {summary['video_id']}\n\n")
        f.write(f"**Watch:** {summary['url']}\n\n")
        
        if summary['status'] == 'success':
            f.write(f"**Summary:**\n\n{summary['summary']}\n\n")
            f.write(f"*Transcript length: {summary['word_count']} words*\n\n")
        else:
            f.write(f"**Status:** {summary['summary']}\n\n")
        
        f.write("---\n\n")

print(f"✓ Created detailed summaries for {len(detailed_summaries)} videos")
print(f"✓ Output file: FINAL_transcript_summaries.md")
