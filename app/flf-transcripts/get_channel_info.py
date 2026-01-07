#!/usr/bin/env python3
import json
import requests

video_ids = [
    "20yWMxAx6QI", "6CVBHgyo-V0", "9lX6cwiw0Ac", "ErYC-F7lJac", "EzVN2IJhP7Q",
    "IkwKzNl6J-g", "NOYGvoB3pk4", "OA-nLfXV7Ks", "P_uMaOzBH_Q", "Q-2Ci4Ajmh8",
    "T3JAWlc1dq0", "TZSCkqxl8q8", "_xtHcBQGYpE", "eHxQRoE3MmA", "jqss-3RYjaE",
    "lCqQIabLKVo", "m5h8Sx8kx18", "qkvFfS_nTI8", "r_vdUeoKbJE", "uX3EdKWo3ZA",
    "vqDRlSWTOUQ"
]

def get_channel_from_oembed(video_id):
    """Get channel info using YouTube oEmbed"""
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # oEmbed doesn't directly give channel URL, but we can extract author name
            author_name = data.get('author_name', '')
            author_url = data.get('author_url', '')
            if author_url:
                return {
                    'channel_url': author_url,
                    'channel_name': author_name
                }
    except Exception as e:
        print(f"Error for {video_id}: {e}")
    return None

channel_info = {}

print("Fetching channel information via oEmbed...")
for i, video_id in enumerate(video_ids, 1):
    print(f"Processing {i}/{len(video_ids)}: {video_id}")
    info = get_channel_from_oembed(video_id)
    if info:
        channel_info[video_id] = info
        print(f"  Found: {info['channel_name']} - {info['channel_url']}")
    else:
        print(f"  Not found")

# Save results
with open('channel_info.json', 'w') as f:
    json.dump(channel_info, f, indent=2)

print(f"\nCompleted! Found {len(channel_info)} channels")
