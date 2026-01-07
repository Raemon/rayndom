#!/usr/bin/env python3
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

video_ids = [
    "20yWMxAx6QI",
    "6CVBHgyo-V0",
    "9lX6cwiw0Ac",
    "ErYC-F7lJac",
    "EzVN2IJhP7Q",
    "IkwKzNl6J-g",
    "NOYGvoB3pk4",
    "OA-nLfXV7Ks",
    "P_uMaOzBH_Q",
    "Q-2Ci4Ajmh8",
    "T3JAWlc1dq0",
    "TZSCkqxl8q8",
    "_xtHcBQGYpE",
    "eHxQRoE3MmA",
    "jqss-3RYjaE",
    "lCqQIabLKVo",
    "m5h8Sx8kx18",
    "qkvFfS_nTI8",
    "r_vdUeoKbJE",
    "uX3EdKWo3ZA",
    "vqDRlSWTOUQ",
    "xsvCYhcxDX4",
    "yqpcsat1Mxw"
]

results = []
api = YouTubeTranscriptApi()

for video_id in video_ids:
    print(f"Processing video: {video_id}")
    try:
        # Get transcript list
        transcript_list = api.list(video_id)
        
        # Try to find English transcript
        transcript = None
        try:
            transcript = transcript_list.find_transcript(['en'])
        except:
            # If no English, try to get generated transcript
            try:
                transcript = transcript_list.find_generated_transcript(['en'])
            except:
                # Get any available transcript
                transcript = transcript_list.find_manually_created_transcript(['en'])
        
        # Fetch the transcript
        transcript_data = transcript.fetch()
        
        # Save full transcript with timestamps
        transcript_entries = []
        for entry in transcript_data:
            transcript_entries.append({
                'text': entry['text'],
                'start': entry['start'],
                'duration': entry.get('duration', 0)
            })
        
        # Also create a combined text version for easy reading
        full_text = " ".join([entry['text'] for entry in transcript_data])
        
        results.append({
            'video_id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'transcript': full_text,
            'transcript_with_timestamps': transcript_entries,
            'success': True
        })
        print(f"  ✓ Successfully retrieved transcript ({len(transcript_entries)} entries, {len(full_text)} characters)")
        
    except TranscriptsDisabled:
        results.append({
            'video_id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'error': 'Transcripts disabled',
            'success': False
        })
        print(f"  ✗ Transcripts disabled")
    except NoTranscriptFound:
        results.append({
            'video_id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'error': 'No transcript found',
            'success': False
        })
        print(f"  ✗ No transcript found")
    except VideoUnavailable:
        results.append({
            'video_id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'error': 'Video unavailable',
            'success': False
        })
        print(f"  ✗ Video unavailable")
    except Exception as e:
        results.append({
            'video_id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'error': str(e),
            'success': False
        })
        print(f"  ✗ Error: {e}")

# Save results
with open('transcripts.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nCompleted! Processed {len(results)} videos")
print(f"Successfully retrieved: {sum(1 for r in results if r['success'])} transcripts")
