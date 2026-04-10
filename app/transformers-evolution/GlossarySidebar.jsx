'use client';
import { useState, useEffect } from 'react';
import { glossary } from './glossary';
import { C } from './colors';
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
    <div style={{
      width: 260,
      minWidth: 260,
      height: '100vh',
      overflowY: 'auto',
      padding: '16px 0',
      fontFamily: "'Source Serif 4', Georgia, serif",
      fontSize: '0.85em',
    }}>
      {/* Posts section */}
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setPostsOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            padding: '8px 16px', background: 'none', border: 'none',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9em',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: C.headerText, fontFamily: 'inherit',
          }}
        >
          <span style={{ transform: postsOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', display: 'inline-block' }}>&#9654;</span>
          Markdown Posts
        </button>
        {postsOpen && (
          <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px' }}>
            {posts.length === 0 && (
              <li style={{ color: C.dim, fontStyle: 'italic', padding: '4px 0' }}>No posts yet</li>
            )}
            {posts.map(post => (
              <li key={post.id}>
                <button
                  onClick={() => onSelectPost?.(post.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 8px', margin: '2px 0',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: C.textAccent, fontFamily: 'inherit', fontSize: 'inherit',
                    borderRadius: 4,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
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
          style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            padding: '8px 16px', background: 'none', border: 'none',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9em',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: C.headerText, fontFamily: 'inherit',
          }}
        >
          <span style={{ transform: glossaryOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', display: 'inline-block' }}>&#9654;</span>
          Glossary Terms
        </button>
        {glossaryOpen && (
          <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px' }}>
            {sortedTerms.map(term => (
              <li key={term} style={{
                padding: '2px 8px', margin: '1px 0',
                fontSize: '0.8em', color: '#1a1a1a',
              }}>
                <JargonSpan term={term} matchedText={term} depth={0} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
