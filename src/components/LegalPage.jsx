import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from './Navbar';
import Footer from './Footer';
import AmbientBackground from './AmbientBackground';

/**
 * LegalPage. Renders a Markdown document fetched from /legal/<file> with
 * brand-styled typography, an optional sticky table-of-contents sidebar, and
 * slugged headings so /docs#verification deep-links work. Wraps the standard
 * Navbar + Footer and sets SEO meta via react-helmet-async.
 */

const GOLD = '#94730D';
const GOLD_LIGHT = '#c89a1f';
const GOLD_BRIGHT = '#e6c873';
const TEXT = '#e4e4e7';
const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace';

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function nodeText(children) {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(nodeText).join('');
  if (children.props && children.props.children) return nodeText(children.props.children);
  return '';
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 860px)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 860px)');
    const h = (e) => setMobile(e.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);
  return mobile;
}

// Build a TOC (H1 chapters + H2 sub-sections) from the raw markdown, skipping
// the document title, the inline "Table of Contents", and anything inside
// code fences.
function buildToc(md) {
  if (!md) return [];
  const out = [];
  let inFence = false;
  let firstH1Seen = false;
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    if (/^```/.test(line.trim())) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^(#{1,2})\s+(.+)$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim();
    if (level === 1 && !firstH1Seen) { firstH1Seen = true; continue; } // page title
    if (/^table of contents$/i.test(text)) continue;
    out.push({ level, text, slug: slugify(text) });
  }
  return out;
}

// ── Markdown link with hover underline ────────────────────────────────────────
function MdLink({ href = '', children }) {
  const [hover, setHover] = useState(false);
  const isExternal = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: hover ? GOLD_BRIGHT : GOLD_LIGHT,
        textDecoration: hover ? 'underline' : 'none',
        textUnderlineOffset: '2px',
        transition: 'color 0.15s',
      }}
    >
      {children}
    </a>
  );
}

function buildComponents() {
  const heading = (tag, style) => ({ children }) => {
    const id = slugify(nodeText(children));
    return React.createElement(tag, { id, style: { ...style, scrollMarginTop: '90px' } }, children);
  };
  return {
    h1: heading('h1', {
      fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15,
      letterSpacing: '-0.02em', color: GOLD_BRIGHT, margin: '8px 0 22px',
    }),
    h2: heading('h2', {
      fontSize: 'clamp(1.35rem, 3.2vw, 1.85rem)', fontWeight: 700, lineHeight: 1.2,
      letterSpacing: '-0.01em', color: GOLD_LIGHT, margin: '44px 0 14px',
      paddingBottom: '8px', borderBottom: '1px solid rgba(200,168,78,0.18)',
    }),
    h3: heading('h3', {
      fontSize: 'clamp(1.1rem, 2.4vw, 1.32rem)', fontWeight: 700, lineHeight: 1.25,
      color: '#d7d7dc', margin: '30px 0 10px',
    }),
    h4: heading('h4', {
      fontSize: '1.05rem', fontWeight: 700, color: '#c9c9d0', margin: '22px 0 8px',
    }),
    p: ({ children }) => (
      <p style={{ fontSize: '1rem', lineHeight: 1.75, color: TEXT, margin: '0 0 16px' }}>{children}</p>
    ),
    a: MdLink,
    strong: ({ children }) => <strong style={{ color: '#f0e3b8', fontWeight: 700 }}>{children}</strong>,
    em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#cfcfd6' }}>{children}</em>,
    ul: ({ children }) => (
      <ul style={{ margin: '0 0 16px', paddingLeft: '22px', color: TEXT, lineHeight: 1.7 }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ margin: '0 0 16px', paddingLeft: '22px', color: TEXT, lineHeight: 1.7 }}>{children}</ol>
    ),
    li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: `3px solid ${GOLD}`, paddingLeft: '16px', margin: '0 0 16px',
        color: '#b6b6bd', fontStyle: 'italic',
      }}>{children}</blockquote>
    ),
    hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(200,168,78,0.16)', margin: '36px 0' }} />,
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', margin: '0 0 18px' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '13.5px',
          background: 'linear-gradient(180deg, rgba(31,32,36,0.7) 0%, rgba(26,27,31,0.7) 100%)',
          border: '1px solid rgba(200,168,78,0.25)', borderRadius: '8px', overflow: 'hidden',
        }}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={{ background: 'rgba(200,168,78,0.1)' }}>{children}</thead>,
    th: ({ children }) => (
      <th style={{
        textAlign: 'left', padding: '10px 12px', color: GOLD_LIGHT, fontWeight: 700,
        borderBottom: '1px solid rgba(200,168,78,0.3)', borderRight: '1px solid rgba(200,168,78,0.12)',
      }}>{children}</th>
    ),
    td: ({ children }) => (
      <td style={{
        padding: '9px 12px', color: TEXT, verticalAlign: 'top',
        borderBottom: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.04)',
      }}>{children}</td>
    ),
    pre: ({ children }) => (
      <pre style={{
        background: '#0d0f14', border: '1px solid rgba(200,168,78,0.25)', borderRadius: '8px',
        padding: '14px 16px', overflowX: 'auto', margin: '0 0 18px',
        fontFamily: MONO, fontSize: '13px', lineHeight: 1.55, color: '#dac98e',
      }}>{children}</pre>
    ),
    code: ({ className, children }) => {
      const text = nodeText(children);
      const isBlock = text.includes('\n') || /language-/.test(className || '');
      if (isBlock) {
        return <code style={{ fontFamily: MONO, background: 'none', color: '#dac98e', padding: 0 }}>{children}</code>;
      }
      return (
        <code style={{
          fontFamily: MONO, fontSize: '0.88em', color: '#e8c869',
          background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.18)',
          padding: '1px 6px', borderRadius: '4px',
        }}>{children}</code>
      );
    },
  };
}

const MD_COMPONENTS = buildComponents();

// ── TOC pieces ────────────────────────────────────────────────────────────────
function TocList({ items, onClick }) {
  return (
    <nav>
      {items.map((it, i) => (
        <a
          key={`${it.slug}-${i}`}
          href={`#${it.slug}`}
          onClick={onClick}
          style={{
            display: 'block',
            padding: it.level === 1 ? '7px 0 4px' : '4px 0 4px 14px',
            fontSize: it.level === 1 ? '13px' : '12.5px',
            fontWeight: it.level === 1 ? 700 : 500,
            letterSpacing: it.level === 1 ? '0.02em' : 0,
            textTransform: it.level === 1 ? 'uppercase' : 'none',
            color: it.level === 1 ? GOLD_LIGHT : 'rgba(228,228,231,0.72)',
            textDecoration: 'none',
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = GOLD_BRIGHT; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = it.level === 1 ? GOLD_LIGHT : 'rgba(228,228,231,0.72)'; }}
        >
          {it.text}
        </a>
      ))}
    </nav>
  );
}

export default function LegalPage({ title, description, file, toc = false }) {
  const [md, setMd] = useState('');
  const [error, setError] = useState(false);
  const mobile = useIsMobile();
  const detailsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setMd(''); setError(false);
    fetch(`${process.env.PUBLIC_URL || ''}/legal/${file}`)
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
      .then((t) => { if (!cancelled) setMd(t); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [file]);

  const tocItems = useMemo(() => (toc ? buildToc(md) : []), [toc, md]);

  const article = (
    <article style={{ maxWidth: '720px', width: '100%', minWidth: 0 }}>
      {error ? (
        <p style={{ color: TEXT }}>
          This document could not be loaded. Please try again, or reach out on the
          AmeretaVerse Discord server.
        </p>
      ) : !md ? (
        <p style={{ color: 'rgba(228,228,231,0.6)' }}>Loading…</p>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>{md}</ReactMarkdown>
      )}
    </article>
  );

  return (
    <>
      <Helmet>
        <title>{title} · AVbot</title>
        <meta name="description" content={description} />
      </Helmet>
      <Navbar />
      <div style={{
        position: 'relative', minHeight: '100vh',
        backgroundColor: '#0a0a0a', color: TEXT,
        fontFamily: 'Sora, sans-serif', overflowX: 'hidden',
      }}>
        <AmbientBackground />

        <div style={{ position: 'relative', zIndex: 1, padding: '92px 20px 32px', maxWidth: toc ? '1120px' : '780px', margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'rgba(228,228,231,0.6)', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600, marginBottom: '20px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = GOLD_LIGHT; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(228,228,231,0.6)'; }}
          >
            ‹ Back to home
          </Link>

          {toc ? (
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>
              {mobile ? (
                <details
                  ref={detailsRef}
                  style={{
                    width: '100%', border: '1px solid rgba(200,168,78,0.22)', borderRadius: '10px',
                    background: 'rgba(16,16,20,0.7)', padding: '10px 14px', marginBottom: '4px',
                  }}
                >
                  <summary style={{ cursor: 'pointer', color: GOLD_LIGHT, fontWeight: 700, fontSize: '14px', listStyle: 'none' }}>
                    Contents
                  </summary>
                  <div style={{ marginTop: '10px', maxHeight: '50vh', overflowY: 'auto' }}>
                    <TocList items={tocItems} onClick={() => { if (detailsRef.current) detailsRef.current.open = false; }} />
                  </div>
                </details>
              ) : (
                <aside style={{
                  position: 'sticky', top: '88px', flex: '0 0 230px', width: '230px',
                  maxHeight: 'calc(100vh - 110px)', overflowY: 'auto',
                  borderRight: '1px solid rgba(200,168,78,0.14)', paddingRight: '18px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(228,228,231,0.4)', marginBottom: '10px' }}>
                    On this page
                  </div>
                  <TocList items={tocItems} />
                </aside>
              )}
              {article}
            </div>
          ) : (
            article
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
