import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import AsyncContent from '../components/AsyncContent'
import { login } from '../features/auth/authSlice'
import { toast } from 'react-hot-toast'

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, user } = useAppSelector((s) => s.auth)
  const isLoading = status === 'loading'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canSubmit = useMemo(() => {
    return Boolean(email.trim() && password.trim())
  }, [email, password])

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [navigate, user])

  return (
    <main className="gc-page gc-auth-page">
      <div className="gc-container">
        <div className="gc-center">
          <div className="gc-card gc-auth-card">
            <div className="gc-auth-header">
              <h2>Welcome back</h2>
              <p>Sign in to manage your subscription and dashboard.</p>
            </div>

            <AsyncContent isLoading={isLoading} error={null}>
              <form
                className="gc-form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!canSubmit) return
                  const action = await dispatch(login({ email, password }))
                  if (login.fulfilled.match(action)) {
                    toast.success('Welcome back!')
                    navigate('/dashboard')
                  } else {
                    toast.error(action.error?.message || 'Login failed')
                  }
                }}
              >
                <div className="gc-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="gc-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="gc-field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    name="password"
                    className="gc-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  className="gc-btn gc-btn-primary gc-btn-full"
                  type="submit"
                  disabled={!canSubmit || isLoading}
                >
                  Sign in
                </button>
              </form>
            </AsyncContent>

            <div className="gc-auth-footer">
              New here? <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
