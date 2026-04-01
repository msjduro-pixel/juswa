import { useState, useEffect, useRef } from 'react';
import './App.css';

const MOCK_RECORDS = [
  { id: '1', name: 'Maria Santos', course: 'BSCS', yearLevel: '3', timestamp: new Date(Date.now() - 86400000) },
  { id: '2', name: 'Juan dela Cruz', course: 'BSIT', yearLevel: '2', timestamp: new Date(Date.now() - 43200000) },
  { id: '3', name: 'Andrea Reyes', course: 'BSIS', yearLevel: '4', timestamp: new Date(Date.now() - 3600000) },
];

function Avatar({ name }) {
  const initials = name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="avatar" style={{ background: color + '22', color }}>
      {initials}
    </div>
  );
}

function StatusDot({ active }) {
  return <span className={`status-dot ${active ? 'active' : ''}`} />;
}

export default function App() {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [form, setForm] = useState({ name: '', course: '', yearLevel: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const nameRef = useRef();

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.course.trim() || !form.yearLevel) return;
    setSaving(true);

    // Simulated Firestore save — replace with real Firestore logic
    await new Promise(r => setTimeout(r, 800));

    const newRecord = {
      id: Date.now().toString(),
      name: form.name.trim(),
      course: form.course.trim(),
      yearLevel: form.yearLevel,
      timestamp: new Date(),
    };

    setRecords(prev => [newRecord, ...prev]);
    setForm({ name: '', course: '', yearLevel: '' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    nameRef.current?.focus();
  };

  const handleDelete = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setDeleteId(null);
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const yearLabels = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.3"/>
            </svg>
          </div>
          <span className="logo-text">StudentDB</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 8h12M2 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Records
          </a>
          <a href="#" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Students
          </a>
          <a href="#" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8h6M5 5h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Reports
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="firebase-badge">
            <StatusDot active />
            <span>Firestore</span>
          </div>
          <p className="course-label">CIT 203 · Lab 6</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">

        {/* Top bar */}
        <header className="topbar">
          <div>
            <h1 className="page-title">Student Records</h1>
            <p className="page-sub">{records.length} enrolled · Quezon City</p>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <input
                className="search-input"
                placeholder="Search name or course..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="content-grid">

          {/* Form panel */}
          <section className="form-panel">
            <div className="panel-header">
              <h2 className="panel-title">Add student</h2>
              {saved && <span className="saved-pill">Saved</span>}
            </div>

            <form onSubmit={handleSubmit} className="record-form">
              <div className="field">
                <label className="field-label">Full name</label>
                <input
                  ref={nameRef}
                  className="field-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Maria Santos"
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label className="field-label">Course</label>
                <input
                  className="field-input"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. BSCS, BSIT, BSIS"
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label className="field-label">Year level</label>
                <div className="year-buttons">
                  {['1', '2', '3', '4'].map(y => (
                    <button
                      key={y}
                      type="button"
                      className={`year-btn ${form.yearLevel === y ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, yearLevel: y }))}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className={`submit-btn ${saving ? 'loading' : ''}`}
                disabled={saving || !form.name.trim() || !form.course.trim() || !form.yearLevel}
              >
                {saving ? (
                  <><span className="spinner" />Saving...</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    Save to Firestore
                  </>
                )}
              </button>
            </form>

            <div className="stats-row">
              {[
                { label: 'Total', value: records.length },
                { label: '1st–2nd Yr', value: records.filter(r => r.yearLevel <= '2').length },
                { label: '3rd–4th Yr', value: records.filter(r => r.yearLevel >= '3').length },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Records list */}
          <section className="records-panel">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/><path d="M11 16h10M16 11v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/></svg>
                <p>{search ? 'No results found' : 'No records yet. Add a student above.'}</p>
              </div>
            ) : (
              <ul className="record-list">
                {filtered.map(record => (
                  <li key={record.id} className="record-item">
                    <Avatar name={record.name} />
                    <div className="record-info">
                      <span className="record-name">{record.name}</span>
                      <div className="record-meta">
                        <span className="course-tag">{record.course}</span>
                        <span className="year-tag">{yearLabels[record.yearLevel]}</span>
                      </div>
                    </div>
                    <div className="record-right">
                      <span className="record-time">{formatTime(record.timestamp)}</span>
                      {deleteId === record.id ? (
                        <div className="delete-confirm">
                          <button className="confirm-yes" onClick={() => handleDelete(record.id)}>Delete</button>
                          <button className="confirm-no" onClick={() => setDeleteId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="delete-btn" onClick={() => setDeleteId(record.id)} title="Delete record">
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}  
          </section>

        </div>
      </main>
    </div>
  );
}