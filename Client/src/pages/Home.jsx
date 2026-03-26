import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="gc-hero">
      <div className="gc-hero-bg" aria-hidden="true">
        <div className="gc-orb gc-orb-1" />
        <div className="gc-orb gc-orb-2" />
        <div className="gc-orb gc-orb-3" />
        <div className="gc-orb gc-orb-4" />
        <div className="gc-orb gc-orb-5" />
        <div className="gc-orb gc-orb-6" />
      </div>
      <div className="gc-container">
        <div className="gc-hero-content">
          <div className="gc-eyebrow">Subscription • Charity • Monthly draw</div>
          <h1 className="gc-hero-title">
            Play. <em>Give.</em> Win.
          </h1>
          <p className="gc-hero-sub">
            A modern subscription platform for golfers that supports charities
            and runs monthly draws.
          </p>
          <div className="gc-hero-actions">
            <Link className="gc-btn gc-btn-primary gc-btn-lg" to="/register">
              Get started
            </Link>
            <Link className="gc-btn gc-btn-outline gc-btn-lg" to="/charities">
              Browse charities
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
