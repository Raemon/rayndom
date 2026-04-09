'use client';
import { useState, useEffect } from 'react';
import { glossary } from './glossary';
import { C } from './colors';

const sortedTerms = Object.keys(glossary).sort((a, b) => a.localeCompare(b));

export default function GlossarySidebar({ onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [expandedTerm, setExpandedTerm] = useState(null);
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
      borderRight: '1px solid rgba(0,0,0,0.1)',
      background: C.rowEven,
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
              <li key={term}>
                <button
                  onClick={() => setExpandedTerm(expandedTerm === term ? null : term)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '4px 8px', margin: '1px 0',
                    background: expandedTerm === term ? 'rgba(0,0,0,0.05)' : 'none',
                    border: 'none', cursor: 'pointer',
                    color: C.textPrimary, fontFamily: 'inherit', fontSize: 'inherit',
                    borderRadius: 4,
                  }}
                  onMouseOver={e => { if (expandedTerm !== term) e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
                  onMouseOut={e => { if (expandedTerm !== term) e.currentTarget.style.background = 'none' }}
                >
                  {term}
                </button>
                {expandedTerm === term && (
                  <div style={{
                    padding: '4px 8px 8px', color: C.textSecondary,
                    fontSize: '0.92em', lineHeight: 1.5,
                  }}>
                    {glossary[term]}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
