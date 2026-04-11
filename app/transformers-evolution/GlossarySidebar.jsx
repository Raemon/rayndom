'use client';
import { useState, useEffect } from 'react';
import { glossary } from './glossary';
import { JargonSpan } from './JargonText';

const sortedTerms = Object.keys(glossary).sort((a, b) => a.localeCompare(b));

export default function GlossarySidebar({ onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [postsOpen, setPostsOpen] = useState(true);
  const [glossaryOpen, setGlossaryOpen] = useState(true);

  useEffect(() => {
    fetch('/api/glossarify')
      .then(res => res.ok ? res.json() : [])
      .then(setPosts)
      .catch(() => {});
  }, []);

  return (
    <div className="w-[260px] min-w-[260px] h-screen overflow-y-auto py-4 font-['Source_Serif_4',Georgia,serif] text-[0.85em]">
      {/* Posts section */}
      <div className="mb-2">
        <button
          onClick={() => setPostsOpen(o => !o)}
          className="flex items-center gap-1.5 w-full py-2 px-4 bg-transparent border-none cursor-pointer font-semibold text-[0.9em] uppercase tracking-[0.08em] text-black font-[inherit]"
        >
          <span className={`inline-block transition-transform duration-150 ${postsOpen ? 'rotate-90' : 'rotate-0'}`}>&#9654;</span>
          Markdown Posts
        </button>
        {postsOpen && (
          <ul className="list-none m-0 px-4">
            {posts.length === 0 && (
              <li className="text-te-dim italic py-1">No posts yet</li>
            )}
            {posts.map(post => (
              <li key={post.id}>
                <button
                  onClick={() => onSelectPost?.(post.id)}
                  className="block w-full text-left py-1.5 px-2 my-0.5 bg-transparent border-none cursor-pointer text-te-accent font-[inherit] text-[length:inherit] rounded hover:bg-black/5"
                >
                  {post.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Glossary section */}
      <div>
        <button
          onClick={() => setGlossaryOpen(o => !o)}
          className="flex items-center gap-1.5 w-full py-2 px-4 bg-transparent border-none cursor-pointer font-semibold text-[0.9em] uppercase tracking-[0.08em] text-black font-[inherit]"
        >
          <span className={`inline-block transition-transform duration-150 ${glossaryOpen ? 'rotate-90' : 'rotate-0'}`}>&#9654;</span>
          Glossary Terms
        </button>
        {glossaryOpen && (
          <ul className="list-none m-0 px-4">
            {sortedTerms.map(term => (
              <li key={term} className="py-0.5 px-2 my-px text-[0.8em] text-te-primary">
                <JargonSpan term={term} matchedText={term} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
