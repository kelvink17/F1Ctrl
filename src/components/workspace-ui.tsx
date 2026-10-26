'use client';

import { useState, type ReactNode } from 'react';

type ActionResult = { message: string; ok: boolean };

export function ActionForm({ action, children, className, confirmMessage }: {
  action: (data: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  confirmMessage?: string;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  return <form className={className} action={async (data) => {
    setPending(true);
    setResult(null);
    try { setResult(await action(data)); }
    catch { setResult({ ok: false, message: 'The request could not be completed. Please try again.' }); }
    finally { setPending(false); }
  }} onSubmit={(event) => {
    if (pending || (confirmMessage && !window.confirm(confirmMessage))) event.preventDefault();
  }}>
    <fieldset disabled={pending} className="action-fieldset">{children}</fieldset>
    {pending && <p className="form-feedback" role="status">Saving to Business Central…</p>}
    {result && <p className={`form-feedback ${result.ok ? 'success' : 'error'}`} role={result.ok ? 'status' : 'alert'}>{result.message}</p>}
  </form>;
}

export function RaceCollection({ items, children }: {
  items: { id: string; name: string; circuit: string; status: string }[];
  children: ReactNode[];
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  if (items.length === 0) return <div className="empty-state glass"><span className="empty-icon" aria-hidden="true">⚑</span><h3>A new season starts here.</h3><p>Create your first Grand Prix to bring your race calendar to life.</p><a href="#new-event" className="secondary-button">Create an event ↗</a></div>;
  const visible = items.map((race, index) => ({ race, card: children[index] })).filter(({ race }) =>
    (status === 'All' || (race.status || '').toLowerCase() === status.toLowerCase()) &&
    `${race.name} ${race.circuit}`.toLowerCase().includes(query.toLowerCase())
  );
  return <>
    <div className="calendar-toolbar">
      <label className="race-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search races or circuits" aria-label="Search races or circuits" /></label>
      <label className="filter-label"><span className="sr-only">Filter by status</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="All">All events</option><option>Upcoming</option><option>Completed</option><option>Cancelled</option></select></label>
    </div>
    <p className="results-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'event' : 'events'}{status !== 'All' ? ` · ${status}` : ''}</p>
    <div className="race-grid">{visible.map(({ race, card }) => <div className="race-wrapper" key={race.id}>{card}</div>)}</div>
    {visible.length === 0 && <div className="empty-state glass"><h3>No races match.</h3><p>Try another circuit, race name, or event status.</p><button className="secondary-button" onClick={() => { setQuery(''); setStatus('All'); }}>Clear filters</button></div>}
  </>;
}

export function WorkspaceNav() {
  const [active, setActive] = useState('overview');
  return <nav aria-label="Workspace">{[
    { id: 'overview', label: 'Overview', icon: '▦' },
    { id: 'race-schedule', label: 'Race calendar', icon: '⚑' },
    { id: 'new-event', label: 'Create event', icon: '＋' },
  ].map(item => <a key={item.id} href={`#${item.id}`} aria-label={item.label} aria-current={active === item.id ? 'location' : undefined} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => setActive(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}{active === item.id && <span className="nav-active-dot" />}</a>)}</nav>;
}
