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
import shutil

def to_pascal_case(text: str) -> str:
    """Convert text to PascalCase for component names."""
    words = re.split(r'[-_\s]+', text)
    return ''.join(word.capitalize() for word in words if word)

def to_kebab_case(text: str) -> str:
    """Convert text to kebab-case for folder names."""
    text = re.sub(r'([a-z])([A-Z])', r'\1-\2', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text.lower()

def create_conversation_topic(topic_name: str):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(script_dir, 'app')
    example_dir = os.path.join(app_dir, 'example')
    api_example_dir = os.path.join(app_dir, 'api', 'example')
    
    folder_name = to_kebab_case(topic_name)
    pascal_name = to_pascal_case(topic_name)
    target_dir = os.path.join(app_dir, folder_name)
    api_target_dir = os.path.join(app_dir, 'api', folder_name)
    
    if os.path.exists(target_dir):
        print(f"Error: Folder '{target_dir}' already exists")
        return False
    
    os.makedirs(target_dir, exist_ok=True)
    
    template_files = [
        ('page.tsx', 'page.tsx'),
        ('ConversationTopicPage.tsx', f'{pascal_name}Page.tsx'),
        ('ConversationTopicSiteItem.tsx', f'{pascal_name}SiteItem.tsx'),
    ]
    for src_name, dst_name in template_files:
        src_path = os.path.join(example_dir, src_name)
        dst_path = os.path.join(target_dir, dst_name)
        
        with open(src_path, 'r') as f:
            content = f.read()
        
        content = content.replace('ConversationTopicPage', f'{pascal_name}Page')
        content = content.replace('ConversationTopicSiteItem', f'{pascal_name}SiteItem')
        content = content.replace('Conversation Topic', topic_name)
        content = content.replace('conversation-topic', folder_name)
        
        with open(dst_path, 'w') as f:
            f.write(content)
        
        print(f"Created: {dst_path}")
    
    # Copy API route
    os.makedirs(os.path.join(api_target_dir, 'file'), exist_ok=True)
    api_src_path = os.path.join(api_example_dir, 'file', 'route.ts')
    api_dst_path = os.path.join(api_target_dir, 'file', 'route.ts')
    
    with open(api_src_path, 'r') as f:
        content = f.read()
    
    content = content.replace('conversation-topic', folder_name)
    
    with open(api_dst_path, 'w') as f:
        f.write(content)
    
    print(f"Created: {api_dst_path}")
    
    print(f"\nSuccessfully created conversation topic at: {target_dir}")
    print(f"API route at: {api_target_dir}")
    print(f"Component prefix: {pascal_name}")
    return True

def main():
    parser = argparse.ArgumentParser(description='Create a new conversation topic folder with page components')
    parser.add_argument('topic_name', help='Name of the conversation topic (e.g., "AI Safety Research")')
    args = parser.parse_args()
    
    create_conversation_topic(args.topic_name)

if __name__ == '__main__':
    main()
