import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import AsyncContent from '../components/AsyncContent'
import { fetchCharities } from '../features/charity/charitySlice'
import { register } from '../features/auth/authSlice'
import { toast } from 'react-hot-toast'

export default function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const auth = useAppSelector((s) => s.auth)
  const charity = useAppSelector((s) => s.charity)

  const isLoading = auth.status === 'loading' || charity.status === 'loading'
  const error = charity.error

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [charityId, setCharityId] = useState('')
  const [subscriptionPlan, setSubscriptionPlan] = useState('monthly')
  const [charityContributionPercent, setCharityContributionPercent] = useState(10)

  useEffect(() => {
    if (charity.status === 'idle') dispatch(fetchCharities())
  }, [charity.status, dispatch])

  useEffect(() => {
    if (auth.user) navigate('/dashboard', { replace: true })
  }, [auth.user, navigate])

  const canSubmit = useMemo(() => {
    return Boolean(name.trim() && email.trim() && password.trim() && charityId)
  }, [name, email, password, charityId])

  return (
    <main className="gc-page gc-auth-page">
      <div className="gc-container">
        <div className="gc-center">
          <div className="gc-card gc-auth-card wide">
            <div className="gc-auth-header">
              <h2>Create your account</h2>
              <p>Pick a charity and start supporting it every month.</p>
            </div>

            <AsyncContent isLoading={isLoading} error={error}>
              <form
                className="gc-form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!canSubmit) return
                  const action = await dispatch(
                    register({
                      name,
                      email,
                      password,
                      charityId,
                      subscriptionPlan,
                      charityContributionPercent,
                    }),
                  )
                  if (register.fulfilled.match(action)) {
                    toast.success('Account created successfully')
                    navigate('/dashboard')
                  } else {
                    toast.error(action.error?.message || 'Registration failed')
                  }
                }}
              >
                <div className="gc-field-row">
                  <div className="gc-field">
                    <label htmlFor="register-name">Name</label>
                    <input
                      id="register-name"
                      name="name"
                      className="gc-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="gc-field">
                    <label htmlFor="register-email">Email</label>
                    <input
                      id="register-email"
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
                </div>

                <div className="gc-field-row">
                  <div className="gc-field">
                    <label htmlFor="register-password">Password</label>
                    <input
                      id="register-password"
                      name="password"
                      className="gc-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="gc-field">
                    <label htmlFor="register-charity">Charity</label>
                    <select
                      id="register-charity"
                      className="gc-input gc-select"
                      value={charityId}
                      onChange={(e) => setCharityId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a charity
                      </option>
                      {charity.items.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="gc-field-row">
                  <div className="gc-field">
                    <label htmlFor="register-plan">Subscription plan</label>
                    <select
                      id="register-plan"
                      className="gc-input gc-select"
                      value={subscriptionPlan}
                      onChange={(e) => setSubscriptionPlan(e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly (discounted)</option>
                    </select>
                  </div>
                  <div className="gc-field">
                    <label htmlFor="register-charity-percent">Charity contribution %</label>
                    <input
                      id="register-charity-percent"
                      className="gc-input"
                      type="number"
                      min={10}
                      max={100}
                      value={charityContributionPercent}
                      onChange={(e) => {
                        const next = Number(e.target.value) || 10
                        setCharityContributionPercent(Math.max(10, Math.min(100, next)))
                      }}
                    />
                  </div>
                </div>

                <button
                  className="gc-btn gc-btn-primary gc-btn-full"
                  type="submit"
                  disabled={!canSubmit || isLoading}
                >
                  Create account
                </button>
              </form>
            </AsyncContent>

            <div className="gc-auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
