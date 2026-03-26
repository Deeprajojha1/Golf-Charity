import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { toast } from 'react-hot-toast'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector((s) => s.auth.user)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkClass = ({ isActive }) => (isActive ? 'is-active' : undefined)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    dispatch(logout())
    setMenuOpen(false)
    toast.success('Logged out')
  }

  return (
    <header className="gc-nav">
      <div className="gc-container gc-nav-inner">
        <Link className="gc-nav-brand" to="/" aria-label="Golf Charity home">
          <span className="gc-brand-mark" aria-hidden="true">
            ●
          </span>
          Golf Charity
        </Link>

        <button
          className="gc-nav-toggle"
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={menuOpen ? 'is-open' : ''} aria-label="Main">
          <ul className="gc-nav-links">
            <li>
              <NavLink className={navLinkClass} to="/charities" onClick={() => setMenuOpen(false)}>
                Charities
              </NavLink>
            </li>
            {user ? (
              <>
                <li>
                  <NavLink className={navLinkClass} to="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                </li>
                {user.isAdmin ? (
                  <li>
                    <NavLink className={navLinkClass} to="/admin" onClick={() => setMenuOpen(false)}>
                      Admin
                    </NavLink>
                  </li>
                ) : null}
                <li>
                  <button 
                    className="gc-nav-logout"
                    type="button" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink className={navLinkClass} to="/login" onClick={() => setMenuOpen(false)}>
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink className={navLinkClass} to="/register" onClick={() => setMenuOpen(false)}>
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
