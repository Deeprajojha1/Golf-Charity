import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="gc-page">
      <div className="gc-container">
        <div className="gc-center">
          <div className="gc-empty-state" role="alert">
            Page not found.
            <div>
              <Link className="gc-btn gc-btn-primary gc-btn-sm" to="/">
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

