import { Suspense } from 'react';
import { ActionForm, RaceCollection, WorkspaceNav } from '../src/components/workspace-ui';
import { connection } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createRaceEvent, getRaceEvents } from '../src/lib/bcApi';
import { handleDeleteRace, handleUpdateRace } from '../src/actions/raceActions';
import type { RaceEvent } from '@/src/types/f1';

const inputClassName = 'field-input';

async function handleCreateRace(formData: FormData) {
  'use server';

  const number = formData.get('number');
  const name = formData.get('name');
  const circuit = formData.get('circuit');
  const raceDate = formData.get('raceDate');
  const status = formData.get('status');
  const location = formData.get('location');
  const season = formData.get('season');

  if (
    typeof number !== 'string' || !number.trim() ||
    typeof name !== 'string' || !name.trim() ||
    typeof circuit !== 'string' || !circuit.trim() ||
    typeof raceDate !== 'string' || !raceDate.trim() ||
    typeof status !== 'string' || !status.trim() ||
    typeof location !== 'string' ||
    (season !== null && typeof season !== 'string')
  ) {
    throw new Error('Please complete all race event fields.');
  }

  const seasonNumber = typeof season === 'string' && season.trim() ? Number(season) : undefined;
  if (seasonNumber !== undefined && !Number.isInteger(seasonNumber)) {
    throw new Error('Season must be a whole number.');
  }

  try {
  await createRaceEvent({
    number: number.trim(),
    name: name.trim(),
    circuit: circuit.trim(),
    raceDate: raceDate.trim(),
    status: status.trim(),
    location: location.trim() || undefined,
    season: seasonNumber,
  });
  revalidatePath('/');
  return { ok: true, message: 'Race event created successfully.' };
  } catch { return { ok: false, message: 'Could not create the event. Check your Business Central connection and try again.' }; }
}

async function updateRace(id: string, formData: FormData) {
  'use server';
  try { await handleUpdateRace(id, formData); return { ok: true, message: 'Race event updated.' }; }
  catch { return { ok: false, message: 'Could not update this event. Check your connection and field values.' }; }
}

async function deleteRace(id: string) {
  'use server';
  try { await handleDeleteRace(id); return { ok: true, message: 'Race event deleted.' }; }
  catch { return { ok: false, message: 'Could not delete this event. Please try again.' }; }
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function CircuitArt() {
  return <svg className="circuit-art" viewBox="0 0 620 300" fill="none" aria-hidden="true">
    <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" stroke="currentColor" strokeWidth=".4" /></pattern><linearGradient id="track"><stop stopColor="#d2e8a0"/><stop offset="1" stopColor="#6e7d60"/></linearGradient></defs>
    <rect width="620" height="300" fill="url(#grid)" opacity=".3"/>
    <path d="M112 210L169 151Q180 140 197 147L234 162Q248 170 260 155L327 72Q340 55 361 64L482 105Q501 112 491 132L457 186Q447 201 428 195L379 179Q363 174 352 188L313 236Q301 250 283 242L220 215Q206 208 193 220L172 239Q158 253 143 240Z" stroke="#d2e8a0" strokeWidth="24" opacity=".035"/>
    <path d="M112 210L169 151Q180 140 197 147L234 162Q248 170 260 155L327 72Q340 55 361 64L482 105Q501 112 491 132L457 186Q447 201 428 195L379 179Q363 174 352 188L313 236Q301 250 283 242L220 215Q206 208 193 220L172 239Q158 253 143 240Z" stroke="url(#track)" strokeWidth="3" strokeLinejoin="round"/>
    <circle cx="143" cy="178" r="5" fill="#d2e8a0"/><circle cx="143" cy="178" r="12" stroke="#d2e8a0" opacity=".3"/>
    <path d="M143 160V116H83" stroke="#89917f" strokeWidth=".7"/><text x="42" y="104" fill="#a4aa9e" fontSize="9" letterSpacing="2">RACE CONTROL</text>
    <text x="430" y="252" fill="#788174" fontSize="9" letterSpacing="2">PRECISION IN EVERY LAP</text>
  </svg>;
}

function RaceFields({ race }: { race?: RaceEvent }) {
  return <div className="form-fields">
    <label>Race code<input className={inputClassName} name="number" placeholder="RACE001" defaultValue={race?.number} required /></label>
    <label>Grand Prix name<input className={inputClassName} name="name" placeholder="Japanese Grand Prix" defaultValue={race?.name} required /></label>
    <label className="full-field">Circuit<input className={inputClassName} name="circuit" placeholder="Suzuka International Racing Course" defaultValue={race?.circuit} required /></label>
    <label className="full-field">Location <span className="optional">/ optional</span><input className={inputClassName} name="location" placeholder="Suzuka, Japan" defaultValue={race?.location} /></label>
    <label>Season<input className={inputClassName} name="season" type="number" step="1" placeholder="2026" defaultValue={race?.season} /></label>
    <label>Race date<input className={inputClassName} name="raceDate" type="date" defaultValue={race?.raceDate.slice(0, 10)} required /></label>
    <label className="full-field">Event status<select className={inputClassName} name="status" defaultValue={race?.status || 'Upcoming'}><option>Upcoming</option><option>Completed</option><option>Cancelled</option></select></label>
  </div>;
}

async function RaceEventsContent() {
  await connection();
  let races: RaceEvent[] = [];
  try { races = await getRaceEvents(); }
  catch { return <><div className="connection-line"><span className="status-dot offline"/>Connection unavailable</div><div className="empty-state glass"><span className="empty-icon">↗</span><h3>Your grid is on standby.</h3><p>We couldn’t reach Business Central. Check your connection and refresh to load your race events.</p><a className="secondary-button" href="/">Retry connection ↗</a></div></>; }
  const upcoming = races.filter(r => (r.status || '').toLowerCase() === 'upcoming');
  const revenue = races.reduce((sum, race) => sum + (race.totalSponsoredRevenue ?? 0), 0);
  return <>
    <div className="connection-line"><span className="status-dot"/>Business Central connected</div>
    <div className="metrics">
      <div className="metric glass"><span>Total events</span><strong>{String(races.length).padStart(2, '0')}</strong><small>Across your race calendar</small></div>
      <div className="metric glass"><span>Upcoming races</span><strong>{String(upcoming.length).padStart(2, '0')}<i className="metric-arrow">↗</i></strong><small>Next on the starting grid</small></div>
      <div className="metric glass"><span>Sponsorship revenue</span><strong>{money.format(revenue)}</strong><small>Total across all events</small></div>
    </div>
    <div className="section-heading"><div><span className="eyebrow">THE CALENDAR</span><h2>Race schedule <span className="count">{races.length}</span></h2></div><span className="section-note">Every event. Every detail.</span></div>
    <RaceCollection items={races.map(({ id, name, circuit, status }) => ({ id, name, circuit, status }))}>
      {races.map((race, index) => <article key={race.id} className="race-card glass">
        <div className="race-top"><span className="race-code">{race.number}</span><span className={`status-pill ${race.status === 'Upcoming' ? 'upcoming' : ''}`}><span/>{race.status || 'Unspecified'}</span></div>
        <div className="race-title"><span className="round-number">{String(index + 1).padStart(2, '0')}</span><h3>{race.name}</h3></div>
        <p className="circuit-name">{race.circuit}</p><p className="race-location">{race.location || 'Location not set'}{race.season ? ` · ${race.season} season` : ''}</p>
        <div className="race-data"><div><span>RACE DAY</span><strong>{race.raceDate ? new Date(`${race.raceDate.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'To be confirmed'}</strong></div><div><span>SPONSORSHIP</span><strong>{money.format(race.totalSponsoredRevenue ?? 0)}</strong></div></div>
        <div className="race-actions"><details className="edit-race"><summary>Edit event <span>↗</span></summary><ActionForm action={updateRace.bind(null, race.id)}><RaceFields race={race}/><button className="primary-button" type="submit">Save changes ↗</button></ActionForm></details><ActionForm action={deleteRace.bind(null, race.id)} confirmMessage={`Delete ${race.name}? This will remove it from Business Central.`}><button className="delete-button" type="submit" aria-label={`Delete ${race.name}`}>Delete</button></ActionForm></div>
      </article>)}
    </RaceCollection>

  </>;
}

export default function HomePage() {
  return <div className="app-shell">
    <aside className="sidebar"><a href="/" className="brand" aria-label="F1CTRL home"><span className="brand-mark">F<span>1</span></span><span>F1CTRL<span className="brand-sub">OPERATIONS PLATFORM</span></span></a><div className="workspace-label">WORKSPACE</div><WorkspaceNav/><div className="sidebar-bottom"><div className="integration-icon">↔</div><strong>Business Central</strong><p>Your operations, in sync.</p><span className="integration-tag">ERP INTEGRATION</span></div><div className="sidebar-footer"><span className="avatar">RC</span><div>Race Control<small>Operations workspace</small></div></div></aside>
    <div className="main-shell"><header className="topbar"><div><span className="breadcrumb">Workspace</span><span className="breadcrumb-slash">/</span>Overview</div><span className="topbar-label"><span className="small-cross">＋</span> MOTORSPORT OPERATIONS</span></header>
    <main id="overview"><section className="page-heading"><div><div className="eyebrow"><span className="tiny-line"/> THE OPERATIONS HUB</div><h1>Race control<span>.</span></h1><p>A clear view of every race. Total control of what’s next.</p></div><a href="#new-event" className="primary-button heading-button">＋ Create event</a></section>
    <section className="hero glass"><div className="hero-copy"><span className="eyebrow">BUILT FOR THE PADDOCK</span><h2>Behind every great race.<br/><span>A precise operation.</span></h2><p>Your calendar, circuits, and sponsorships.<br/>One place to keep everything on track.</p><a href="#race-schedule">Explore your calendar <span>↗</span></a></div><CircuitArt/><div className="hero-index">F1CTRL / OPERATIONS INTELLIGENCE <span>01 — ∞</span></div></section>
    <div className="content-layout"><section id="race-schedule" className="schedule-section"><Suspense fallback={<div className="loading-state glass" role="status"><span className="status-dot"/> Loading race operations…</div>}><RaceEventsContent/></Suspense></section>
    <aside id="new-event" className="create-panel glass"><div className="panel-heading"><span className="eyebrow">PLAN THE NEXT CHAPTER</span><span className="panel-plus">＋</span><h2>New race event</h2><p>From the first light to the final lap.</p></div><ActionForm action={handleCreateRace}><RaceFields/><button type="submit" className="primary-button">Create race event <span>↗</span></button><p className="form-note">Saved directly to Business Central</p></ActionForm></aside></div>
    <footer className="page-footer"><span>F1CTRL <span className="footer-divider">/</span> Precision beyond the circuit.</span><span>RACE OPERATIONS WORKSPACE</span></footer></main></div>
  </div>;
}
