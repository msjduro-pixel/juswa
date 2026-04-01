import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const COURSES = ['BSCS', 'BSIT', 'BSIS', 'BSECE', 'BSME', 'BSA', 'BSBA', 'BSED'];
const YEAR_LABELS = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

const PALETTES = [
  { bg: '#e0f2fe', fg: '#0369a1' }, { bg: '#ede9fe', fg: '#6d28d9' },
  { bg: '#dcfce7', fg: '#15803d' }, { bg: '#fef9c3', fg: '#a16207' },
  { bg: '#fce7f3', fg: '#be185d' }, { bg: '#ffedd5', fg: '#c2410c' },
  { bg: '#e0f2f1', fg: '#00695c' }, { bg: '#f3e8ff', fg: '#7e22ce' },
];

const SEED = [
  { id: '1', name: 'Maria Santos',   course: 'BSCS',  yearLevel: '3', createdAt: Date.now() - 172800000 },
  { id: '2', name: 'Juan dela Cruz', course: 'BSIT',  yearLevel: '2', createdAt: Date.now() - 86400000  },
  { id: '3', name: 'Andrea Reyes',   course: 'BSIS',  yearLevel: '4', createdAt: Date.now() - 43200000  },
  { id: '4', name: 'Carlo Mendoza',  course: 'BSECE', yearLevel: '1', createdAt: Date.now() - 7200000   },
  { id: '5', name: 'Sophia Lim',     course: 'BSCS',  yearLevel: '2', createdAt: Date.now() - 1800000   },
];

function getInitials(n) { return n.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase(); }
function getPalette(n)   { return PALETTES[n.charCodeAt(0) % PALETTES.length]; }
function relTime(ts) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return new Date(ts).toLocaleDateString('en-PH', { month:'short', day:'numeric' });
}

function Avatar({ name, size = 38 }) {
  const { bg, fg } = getPalette(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: fg,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight: 600, fontSize: size * 0.33, flexShrink: 0, letterSpacing: '-0.3px'
    }}>{getInitials(name)}</div>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

function Bar({ value, max, color }) {
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${Math.round((value / Math.max(max,1)) * 100)}%`, background: color }} />
    </div>
  );
}

export default function App() {
  const [records, setRecords]       = useState(SEED);
  const [form, setForm]             = useState({ name:'', course:'', yearLevel:'' });
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('newest');
  const [filterYear, setFilterYear] = useState('all');
  const [view, setView]             = useState('records');
  const [confirmId, setConfirmId]   = useState(null);
  const nameRef = useRef();

  const showToast = useCallback((msg, type='success') => setToast({ msg, type, k: Date.now() }), []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.course || !form.yearLevel) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 750));
    const rec = { id: Date.now().toString(), name: form.name.trim(), course: form.course, yearLevel: form.yearLevel, createdAt: Date.now() };
    setRecords(p => [rec, ...p]);
    setForm({ name:'', course:'', yearLevel:'' });
    setSaving(false);
    showToast(`${rec.name} saved to Firestore`);
    nameRef.current?.focus();
  };

  const doDelete = id => {
    const rec = records.find(r => r.id === id);
    setRecords(p => p.filter(r => r.id !== id));
    setConfirmId(null);
    showToast(`${rec?.name} deleted`, 'danger');
  };

  const filtered = records
    .filter(r => {
      const q = search.toLowerCase();
      return (!q || r.name.toLowerCase().includes(q) || r.course.toLowerCase().includes(q))
          && (filterYear === 'all' || r.yearLevel === filterYear);
    })
    .sort((a, b) =>
      sortBy === 'name'   ? a.name.localeCompare(b.name) :
      sortBy === 'oldest' ? a.createdAt - b.createdAt :
                            b.createdAt - a.createdAt
    );

  const courseStats = COURSES.map(c => ({ c, n: records.filter(r => r.course === c).length })).filter(s => s.n > 0).sort((a,b)=>b.n-a.n);
  const maxC = Math.max(...courseStats.map(s=>s.n), 1);
  const yearStats = ['1','2','3','4'].map(y => ({ y, n: records.filter(r=>r.yearLevel===y).length }));
  const yColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b'];

  return (
    <div className="shell">
      {toast && <Toast key={toast.k} msg={toast.msg} type={toast.type} onDone={()=>setToast(null)} />}

      {confirmId && (
        <div className="overlay" onClick={() => setConfirmId(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 7v4M10 13.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="modal-heading">Remove student?</p>
            <p className="modal-body">
              <strong>{records.find(r=>r.id===confirmId)?.name}</strong> will be permanently deleted from Firestore.
            </p>
            <div className="modal-btns">
              <button className="mbtn-ghost" onClick={()=>setConfirmId(null)}>Cancel</button>
              <button className="mbtn-red"   onClick={()=>doDelete(confirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".95"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".6"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".6"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".3"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">StudentDB</div>
            <div className="brand-sub">CIT 203 · Lab 6</div>
          </div>
        </div>

        <nav className="snav">
          <button className={`snav-btn ${view==='records'?'active':''}`} onClick={()=>setView('records')}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 4h11M2 7.5h11M2 11h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Records
          </button>
          <button className={`snav-btn ${view==='analytics'?'active':''}`} onClick={()=>setView('analytics')}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="9" width="3" height="5" rx=".8" fill="currentColor" opacity=".6"/>
              <rect x="6" y="5" width="3" height="9" rx=".8" fill="currentColor" opacity=".8"/>
              <rect x="11" y="1" width="3" height="13" rx=".8" fill="currentColor"/>
            </svg>
            Analytics
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="db-pill">
            <span className="db-dot" />
            <span>Firestore</span>
            <span className="db-ok">Live</span>
          </div>
          <div className="rec-pill">{records.length} records</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main">

        {/* Topbar */}
        <header className="topbar">
          <div>
            <h1 className="page-title">{view === 'records' ? 'Student Records' : 'Analytics'}</h1>
            <p className="page-sub">CIT 203 · Platform Technology · Deploying React + Firestore</p>
          </div>
          <div className="search-wrap">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{opacity:.45}}>
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input className="search-inp" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
            {search && <button className="search-clear" onClick={()=>setSearch('')}>×</button>}
          </div>
        </header>

        {/* Stat strip */}
        <div className="stat-strip">
          {[
            { label:'Total students', n: records.length,                                    color:'#6366f1' },
            { label:'Courses active', n: courseStats.length,                                color:'#0ea5e9' },
            { label:'1st & 2nd year', n: records.filter(r=>r.yearLevel<='2').length,        color:'#10b981' },
            { label:'3rd & 4th year', n: records.filter(r=>r.yearLevel>='3').length,        color:'#f59e0b' },
          ].map(s => (
            <div key={s.label} className="stat-tile">
              <span className="stat-n" style={{color:s.color}}>{s.n}</span>
              <span className="stat-l">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="body">

          {/* Form column */}
          <div className="form-col">
            <div className="card">
              <p className="card-title">Add student</p>
              <form onSubmit={handleSubmit} className="form">
                <label className="flbl">Full name</label>
                <input
                  ref={nameRef}
                  className="finp"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Maria Santos"
                  autoComplete="off"
                />

                <label className="flbl">Course</label>
                <div className="chip-grid">
                  {COURSES.map(c => (
                    <button key={c} type="button"
                      className={`chip ${form.course===c?'chip-on':''}`}
                      onClick={()=>setForm(f=>({...f,course:c}))}
                    >{c}</button>
                  ))}
                </div>

                <label className="flbl">Year level</label>
                <div className="year-row">
                  {['1','2','3','4'].map((y,i) => (
                    <button key={y} type="button"
                      className={`ybtn ${form.yearLevel===y?'ybtn-on':''}`}
                      onClick={()=>setForm(f=>({...f,yearLevel:y}))}
                    >
                      <span className="y-n">{y}</span>
                      <span className="y-s">{['st','nd','rd','th'][i]}</span>
                    </button>
                  ))}
                </div>

                <button className="submit" disabled={saving||!form.name.trim()||!form.course||!form.yearLevel}>
                  {saving
                    ? <><span className="spin"/>Saving…</>
                    : <><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Save to Firestore</>
                  }
                </button>
              </form>
            </div>

            {/* Recent */}
            {records.length > 0 && (
              <div className="card">
                <p className="card-title">Recently added</p>
                <div className="recent">
                  {[...records].sort((a,b)=>b.createdAt-a.createdAt).slice(0,4).map(r=>(
                    <div key={r.id} className="recent-row">
                      <Avatar name={r.name} size={30}/>
                      <div className="recent-info">
                        <span className="recent-name">{r.name}</span>
                        <span className="recent-meta">{r.course} · {YEAR_LABELS[r.yearLevel]}</span>
                      </div>
                      <span className="recent-time">{relTime(r.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content column */}
          <div className="content-col">

            {view === 'records' && (
              <div className="card records-card">
                <div className="toolbar">
                  <span className="result-count">{filtered.length} of {records.length} students</span>
                  <div className="toolbar-right">
                    <select className="sel" value={filterYear} onChange={e=>setFilterYear(e.target.value)}>
                      <option value="all">All years</option>
                      {['1','2','3','4'].map(y=><option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                    </select>
                    <select className="sel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="name">Name A–Z</option>
                    </select>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="empty">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.2" opacity=".2"/>
                      <path d="M11 16h10M16 11v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".25"/>
                    </svg>
                    <span>{search?`No results for "${search}"`:'No records yet. Add a student.'}</span>
                  </div>
                ) : (
                  <div className="table">
                    <div className="thead">
                      <span>Student</span><span>Course</span><span>Year</span><span>Added</span><span/>
                    </div>
                    {filtered.map((r, i) => (
                      <div key={r.id} className="trow" style={{animationDelay:`${i*0.04}s`}}>
                        <div className="tcell-student"><Avatar name={r.name} size={34}/><span className="row-name">{r.name}</span></div>
                        <span><span className="badge-course">{r.course}</span></span>
                        <span><span className="badge-year">{YEAR_LABELS[r.yearLevel]}</span></span>
                        <span className="row-time">{relTime(r.createdAt)}</span>
                        <button className="del" onClick={()=>setConfirmId(r.id)} title="Remove">
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'analytics' && (
              <div className="analytics">
                <div className="card">
                  <p className="card-title">Students by course</p>
                  {courseStats.length === 0
                    ? <p className="no-data">No data yet</p>
                    : courseStats.map(s => (
                      <div key={s.c} className="chart-row">
                        <span className="chart-lbl">{s.c}</span>
                        <Bar value={s.n} max={maxC} color="#6366f1"/>
                        <span className="chart-val">{s.n}</span>
                      </div>
                    ))
                  }
                </div>

                <div className="card">
                  <p className="card-title">Distribution by year</p>
                  <div className="year-vis">
                    {yearStats.map((s,i) => {
                      const pct = Math.round((s.n / Math.max(records.length, 1)) * 100);
                      return (
                        <div key={s.y} className="year-col">
                          <span className="year-pct" style={{color: yColors[i]}}>{pct}%</span>
                          <div className="year-bar-track">
                            <div className="year-bar-fill" style={{height:`${pct}%`, background: yColors[i]}}/>
                          </div>
                          <span className="year-lbl">{YEAR_LABELS[s.y].replace(' Year','')}</span>
                          <span className="year-n">{s.n}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card">
                  <p className="card-title">Summary</p>
                  <div className="summary">
                    {[
                      { l:'Total enrolled',     v: records.length },
                      { l:'Unique courses',      v: courseStats.length },
                      { l:'Top course',          v: courseStats[0]?.c || '—' },
                      { l:'Largest year group',  v: [...yearStats].sort((a,b)=>b.n-a.n)[0]?.y ? YEAR_LABELS[([...yearStats].sort((a,b)=>b.n-a.n)[0].y)] : '—' },
                    ].map(s=>(
                      <div key={s.l} className="sum-row">
                        <span className="sum-l">{s.l}</span>
                        <span className="sum-v">{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}