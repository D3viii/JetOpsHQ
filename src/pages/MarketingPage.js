import { Link } from 'react-router-dom';
import jetOpsLogo from '../assets/jetopshq-logo.png';

const featureSections = [
  {
    eyebrow: 'Dispatch visibility',
    title: 'See the operation before it turns into a scramble.',
    body: 'JetOpsHQ gives operators one high-clarity surface for trips, aircraft, crew, maintenance pressure, and schedule movement so the day can be managed proactively instead of reactively.',
    bullets: [
      'Dispatch-focused operational visibility',
      'Trip, crew, and aircraft awareness in one place',
      'Faster recognition of gaps, conflicts, and timing risk',
    ],
  },
  {
    eyebrow: 'Scheduling intelligence',
    title: 'Coordinate aircraft and crew with less friction.',
    body: 'Instead of bouncing between scattered spreadsheets and disconnected updates, JetOpsHQ is designed to make scheduling and resource decisions easier to understand and faster to act on.',
    bullets: [
      'Crew and aircraft assignment visibility',
      'Cleaner schedule coordination across active trips',
      'A stronger operational picture for dispatch teams',
    ],
  },
  {
    eyebrow: 'Maintenance awareness',
    title: 'Keep availability and downtime tied to real operations.',
    body: 'Operators need more than a static aircraft list. JetOpsHQ is built to surface where maintenance, availability, and fleet readiness affect live trip execution.',
    bullets: [
      'Aircraft downtime awareness',
      'Maintenance coordination visibility',
      'Better operational decision support under pressure',
    ],
  },
];

function HeroVisual() {
  return (
    <div className="jhq-hero-visual-shell">
      <div className="jhq-hero-glow jhq-hero-glow-red" />
      <div className="jhq-hero-glow jhq-hero-glow-white" />
      <div className="jhq-hero-surface">
        <div className="jhq-hero-topline">
          <span>JetOpsHQ mission control</span>
          <strong>Private aviation operations intelligence for scheduling, dispatch, and fleet awareness.</strong>
        </div>

        <div className="jhq-hero-grid">
          <div className="jhq-panel jhq-panel-primary">
            <span className="jhq-label">Live operation</span>
            <strong>Trips, tails, crews, and pressure points aligned into one operating view.</strong>
            <div className="jhq-metric-stack">
              <div><span>Active trips</span><b>14</b></div>
              <div><span>Crew gaps</span><b>2</b></div>
              <div><span>Aircraft watch items</span><b>3</b></div>
            </div>
          </div>

          <div className="jhq-panel jhq-panel-secondary">
            <div className="jhq-status-line"><span>N918JH · Teterboro → Palm Beach</span><b>Scheduled</b></div>
            <div className="jhq-status-line"><span>N402VJ · Van Nuys → Aspen</span><b>Awaiting crew</b></div>
            <div className="jhq-status-line"><span>N771QS · Chicago → Naples</span><b>Maintenance watch</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <main className="jhq-marketing-page">
      <section className="jhq-marketing-hero">
        <div className="jhq-brand-lockup">
          <img src={jetOpsLogo} alt="JetOpsHQ logo" className="jhq-brand-logo" />
        </div>

        <div className="jhq-hero-copy">
          <p className="jhq-eyebrow">Private aviation operations intelligence</p>
          <h2>Control scheduling, dispatch, and fleet awareness from one sharper operating surface.</h2>
          <p className="jhq-hero-lead">
            JetOpsHQ is designed for operators that need clearer visibility across trips, crew, aircraft availability, maintenance coordination, and day-of-operation pressure.
          </p>
        </div>

        <HeroVisual />
      </section>

      <section className="jhq-feature-sections">
        {featureSections.map((feature, index) => (
          <article key={feature.title} className={`jhq-feature-row ${index % 2 === 1 ? 'reverse' : ''}`}>
            <div className="jhq-feature-copy">
              <span className="jhq-story-index">0{index + 1}</span>
              <p className="jhq-eyebrow">{feature.eyebrow}</p>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
              <ul>
                {feature.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className="jhq-feature-visual">
              <div className="jhq-visual-card">
                <div className="jhq-visual-topbar"><span /><span /><span /></div>
                <div className="jhq-visual-body">
                  <div className="jhq-visual-line wide" />
                  <div className="jhq-visual-line medium" />
                  <div className="jhq-visual-line short" />
                  <div className="jhq-visual-grid">
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="jhq-final-cta-section">
        <div className="jhq-final-cta-card">
          <p className="jhq-eyebrow">Locked JetOpsHQ demo</p>
          <h2>Want to see the demo environment?</h2>
          <p>
            The product walkthrough is intentionally gated. Use the demo access page to unlock the experience and view the current JetOpsHQ operational prototype.
          </p>
          <div className="jhq-cta-row center-row">
            <Link to="/demo" className="jhq-primary-button">Open demo access</Link>
          </div>
        </div>
      </section>

      <footer className="jhq-site-footer">
        <p>© 2026 JetOpsHQ. Built by Carr Identity Group LLC. All rights reserved.</p>
      </footer>
    </main>
  );
}
