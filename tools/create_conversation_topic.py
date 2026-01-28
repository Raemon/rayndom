#!/usr/bin/env python3
"""
Creates a new conversation topic folder with page components.

Usage:
    python create_conversation_topic.py my-topic-name
    python create_conversation_topic.py "AI Safety Research"
"""

import argparse
import os
import re

def to_title_case(text: str) -> str:
    """Convert text to Title Case for display."""
    words = re.split(r'[-_\s]+', text)
    return ' '.join(word.capitalize() for word in words if word)

def to_kebab_case(text: str) -> str:
    """Convert text to kebab-case for folder names."""
    text = re.sub(r'([a-z])([A-Z])', r'\1-\2', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text.lower()

def create_conversation_topic(topic_name: str):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.abspath(os.path.join(script_dir, '..', 'app'))
    
    folder_name = to_kebab_case(topic_name)
    title = to_title_case(topic_name)
    target_dir = os.path.join(app_dir, folder_name)
    
    if os.path.exists(target_dir):
        print(f"Error: Folder '{target_dir}' already exists")
        return False
    
    os.makedirs(target_dir, exist_ok=True)
    
    page_content = f'''import ConversationTopicPage from '../cast-corrigibility-sequence/ConversationTopicPage'
import {{ getDomainsFromDownloads, getOutputFiles }} from '../cast-corrigibility-sequence/page'

export default function Page() {{
  const domains = getDomainsFromDownloads('{folder_name}')
  const outputFiles = getOutputFiles('{folder_name}')
  return <ConversationTopicPage domains={{domains}} topic="{folder_name}" title="{title}" outputFiles={{outputFiles}} />
}}
'''
    
    page_path = os.path.join(target_dir, 'page.tsx')
    with open(page_path, 'w') as f:
        f.write(page_content)
    
    print(f"Created: {page_path}")
    print(f"\nSuccessfully created conversation topic at: {target_dir}")
    print(f"Title: {title}")
    return True

def main():
    parser = argparse.ArgumentParser(description='Create a new conversation topic folder with page components')
    parser.add_argument('topic_name', help='Name of the conversation topic (e.g., "AI Safety Research")')
    args = parser.parse_args()
    
    create_conversation_topic(args.topic_name)

if __name__ == '__main__':
    main()
