// Home page: signature entry panel with a live Tacet mark and direct access to the rotation workflow.
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { AliveTacetMark } from '../components/shared/ui'
import '../styles/HomePage.css'

// ========== Main Home Page ===================================================================================================

export default function HomePage() {
  return (
    <section className="home-page">
      <article className="home-hero ui-plate" style={{ '--ui-accent-raw': '193 93% 70%' } as CSSProperties}>
        <div className="home-hero-copy">
          <p className="home-hero-kicker">Wuthering Waves Toolkit</p>
          <h1 className="home-hero-title">Alive Tacet Mark</h1>
          <p className="home-hero-body">
            A reactive crest motif for dashboard intros, overlays, and loading states. Tuned to stay crisp under motion while preserving the Tacet silhouette.
          </p>
          <div className="home-hero-actions">
            <Link to="/rotations" className="home-hero-btn">
              Open Rotation Editor
            </Link>
          </div>
        </div>

        <div className="home-hero-mark-wrap" aria-hidden="true">
          <AliveTacetMark seed="wuthering-waves-alive" className="home-hero-mark" />
        </div>
      </article>
    </section>
  )
}
