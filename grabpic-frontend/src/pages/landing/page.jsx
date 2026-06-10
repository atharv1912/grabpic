import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '◎',
    title: 'ArcFace recognition',
    desc: '512-dimensional face embeddings deliver high accuracy even in group shots, low light, and side profiles.',
  },
  {
    icon: '⚡',
    title: 'Instant upload response',
    desc: 'Photos land immediately. Face processing runs in the background via a job queue — no waiting at upload.',
  },
  {
    icon: '🔗',
    title: 'Join with a code',
    desc: 'Share a 6-character code. Anyone in the group can upload and anyone can search — no roles, no friction.',
  },
  {
    icon: '🔒',
    title: 'Member-only access',
    desc: 'Photos and search results are visible only to verified event members. Nothing is publicly accessible.',
  },
];

const USE_CASES = [
  { emoji: '🎓', title: 'College fests', desc: 'Find yourself across hundreds of photos from one evening' },
  { emoji: '🏕️', title: 'Group trips',   desc: 'Every candid, every trek shot — sorted for you'           },
  { emoji: '💍', title: 'Weddings',       desc: 'Guests find their moments without chasing the photographer' },
  { emoji: '🏆', title: 'Sports events',  desc: 'Spot yourself in action shots from any angle'              },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        minHeight: '100dvh',
        lineHeight: 1.6,
      }}
    >
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 40px',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg)',
          zIndex: 10,
        }}
      >
        <button 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
        >
          <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
          GrabPic
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['How it works', 'Features', 'Use cases'].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}
            >
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/login')}  className="btn-outline-lp">Log in</button>
          <button onClick={() => navigate('/register')} className="btn-primary-lp">Get started</button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '100px 40px 80px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 500,
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--accent-ring)',
            marginBottom: 28,
          }}
        >
          ✦ Powered by face recognition
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: 20,
            color: 'var(--text-primary)',
          }}
        >
          Find every photo{' '}
          <span style={{ color: 'var(--accent)' }}>you're in</span>,
          <br />instantly.
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 36px' }}>
          Upload a selfie. GrabPic scans your event album and surfaces every photo where you appear — no scrolling, no guessing.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} className="btn-primary-lp" style={{ fontSize: 15, padding: '14px 28px' }}>
            Create an event
          </button>
          <button onClick={() => navigate('/join')} className="btn-outline-lp" style={{ fontSize: 15, padding: '14px 28px' }}>
            Join with a code
          </button>
        </div>

        {/* Mock UI */}
        <div
          style={{
            marginTop: 60,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 32,
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'left',
          }}
        >
          {/* Event row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: 'var(--surface-alt)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}
            >
              KT
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Kokan Trip 2025</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>42 photos · 8 members</div>
            </div>
            <span
              style={{
                fontSize: 11, background: 'var(--accent-soft)', color: 'var(--accent)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 500,
                fontFamily: 'monospace', letterSpacing: 1,
              }}
            >
              F72BB7
            </span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            Showing photos with <strong style={{ color: 'var(--accent)' }}>you</strong> in them
          </div>

          {/* Photo grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { bg: '#EEF2FF', emoji: '🏖️', match: true  },
              { bg: '#FEF9EE', emoji: '🌊', match: false },
              { bg: '#EEFEF4', emoji: '🌴', match: true  },
              { bg: '#FEF0EE', emoji: '🌅', match: true  },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-md)',
                  background: p.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {p.emoji}
                {p.match && (
                  <>
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        border: '2.5px solid var(--accent)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute', bottom: 4, left: 4,
                        background: 'var(--accent)', color: '#fff',
                        fontSize: 9, fontWeight: 600,
                        padding: '2px 6px', borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Match
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 860, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="section-eyebrow">How it works</div>
        <h2 className="section-heading">Three steps to your photos</h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 460 }}>
          No account setup friction. Join, shoot, find — in under a minute.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40 }}>
          {[
            { n: '1', title: 'Join with a code', desc: 'Get a 6-character code from the organizer and instantly enter the shared event album.' },
            { n: '2', title: 'Everyone uploads',  desc: 'Any member uploads photos from the event. The AI processes each one in the background.' },
            { n: '3', title: 'Find yourself',      desc: 'Drop a selfie. GrabPic returns every photo you appear in, ranked by match confidence.' },
          ].map((s, i) => (
            <div key={i} className="card-lp">
              <div
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 860, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="section-eyebrow">Features</div>
        <h2 className="section-heading">Everything you need, nothing you don't</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginTop: 40 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card-lp">
              <div
                style={{
                  width: 40, height: 40,
                  background: 'var(--accent-soft)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Use cases ───────────────────────────────────── */}
      <section id="use-cases" style={{ maxWidth: 860, margin: '0 auto', padding: '0 40px 80px' }}>
        <div className="section-eyebrow">Use cases</div>
        <h2 className="section-heading">Built for every group moment</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 40 }}>
          {USE_CASES.map((u) => (
            <div key={u.title} className="card-lp" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{u.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{u.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{u.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <div style={{ padding: '0 40px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--text-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '64px 40px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 36,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.8px',
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            Never miss a photo<br />of yourself again.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>
            Join an event in seconds. Your photos, found in one selfie.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: 'var(--radius-full)',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Get started free
          </button>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 860,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
          <span style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
          GrabPic
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2025 GrabPic · Built with Node.js, Python &amp; pgvector
        </div>
      </footer>

      {/* ── Scoped styles ───────────────────────────────── */}
      <style>{`
        .btn-primary-lp {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .btn-primary-lp:hover { background: var(--accent-hover); }

        .btn-outline-lp {
          background: transparent;
          color: var(--text-primary);
          border: 1.5px solid var(--border);
          padding: 10px 20px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .btn-outline-lp:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-soft);
        }

        .section-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .section-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.8px;
          line-height: 1.2;
          color: var(--text-primary);
          margin-bottom: 14px;
        }

        .card-lp {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
        }

        nav a:hover { color: var(--text-primary) !important; }
      `}</style>
    </div>
  );
}