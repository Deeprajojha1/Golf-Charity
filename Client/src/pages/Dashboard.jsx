import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import AsyncContent from '../components/AsyncContent'
import { fetchMe } from '../features/auth/authSlice'
import { addScore, editScore, fetchDashboard } from '../features/dashboard/dashboardSlice'
import { winnerAPI } from '../services/winnerAPI'
import { subscriptionAPI } from '../services/subscriptionAPI'
import { toast } from 'react-hot-toast'
import { drawAPI } from '../services/drawAPI'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { status, error, user } = useAppSelector((s) => s.auth)
  const dashboardState = useAppSelector((s) => s.dashboard)

  const [score, setScore] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [editingScoreId, setEditingScoreId] = useState(null)
  const [winners, setWinners] = useState([])
  const [proofInputs, setProofInputs] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [latestDraw, setLatestDraw] = useState(null)
  const [drawFallback, setDrawFallback] = useState(null)

  const isLoading = status === 'loading' && !user
  const data = dashboardState.data

  useEffect(() => {
    if (!user) dispatch(fetchMe())
  }, [dispatch, user])

  useEffect(() => {
    if (user) dispatch(fetchDashboard())
  }, [dispatch, user])

  useEffect(() => {
    const loadWinners = async () => {
      if (!user) return
      try {
        const res = await winnerAPI.listMine()
        setWinners(res.winners || [])
      } catch {
        // errors handled by global AsyncContent
      }
    }
    loadWinners()
  }, [user])

  useEffect(() => {
    const loadLatestDraw = async () => {
      if (!user) return
      try {
        const res = await drawAPI.latest()
        setLatestDraw(res.draw || null)
        setDrawFallback(res.fallback || null)
      } catch {
        // silent
      }
    }
    loadLatestDraw()
  }, [user])

  const scoreSubmitLabel = useMemo(() => {
    return editingScoreId ? 'Update score' : 'Add score'
  }, [editingScoreId])

  const initials = (user?.name || user?.email || '?')
    .trim()
    .slice(0, 1)
    .toUpperCase()

  const handleScoreSubmit = async (e) => {
    e.preventDefault()
    const payload = { score: Number(score), date }

    if (editingScoreId) {
      await dispatch(editScore({ scoreId: editingScoreId, payload }))
      toast.success('Score updated')
      setEditingScoreId(null)
    } else {
      await dispatch(addScore(payload))
      toast.success('Score added')
    }

    setScore('')
    setDate(new Date().toISOString().slice(0, 10))
  }

  const startEdit = (item) => {
    setEditingScoreId(item._id)
    setScore(String(item.value))
    setDate(new Date(item.playedAt).toISOString().slice(0, 10))
  }

  const handleProofSubmit = async (winnerId) => {
    const payload = proofInputs[winnerId]
    if (!payload?.url) return
    setSubmitting(true)
    try {
      await winnerAPI.submitProof(winnerId, { proofUrl: payload.url, note: payload.note })
      toast.success('Proof submitted')
      const res = await winnerAPI.listMine()
      setWinners(res.winners || [])
      setProofInputs((prev) => ({ ...prev, [winnerId]: { url: '', note: '' } }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelSubscription = async () => {
    setSubmitting(true)
    try {
      await subscriptionAPI.cancel()
      toast.success('Subscription cancelled')
      await dispatch(fetchDashboard())
    } finally {
      setSubmitting(false)
    }
  }

  const handleRenewSubscription = async () => {
    setSubmitting(true)
    try {
      await subscriptionAPI.renew(data?.subscription?.plan || 'monthly')
      toast.success('Subscription renewed')
      await dispatch(fetchDashboard())
    } finally {
      setSubmitting(false)
    }
  }

  const userScores = (data?.scores || []).map((s) => Number(s.value))
  const drawNumbers = latestDraw?.numbers || drawFallback?.numbers || []
  const matchedCount = drawNumbers.filter((n) => userScores.includes(n)).length

  return (
    <main className="gc-page">
      <div className="gc-container">
        <AsyncContent
          isLoading={isLoading || (user && dashboardState.status === 'loading' && !data)}
          error={error || dashboardState.error}
          onRetry={() => dispatch(fetchMe())}
        >
          <div className="gc-page-header">
            <div>
              <h1 className="gc-page-title">
                Your <em>Dashboard</em>
              </h1>
              <p className="gc-page-sub">
                Signed in as <strong>{user?.email}</strong>
              </p>
            </div>
            <div className="gc-avatar" aria-hidden="true">
              {initials}
            </div>
          </div>

          <div className="gc-stats-grid">
            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                👤
              </div>
              <div className="gc-stat-value">{user?.name || 'Member'}</div>
              <div className="gc-stat-label">Account name</div>
            </div>

            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                ✉️
              </div>
              <div className="gc-stat-value">{user?.email}</div>
              <div className="gc-stat-label">Email</div>
            </div>

            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                🎗️
              </div>
              <div className="gc-stat-value">
                {data?.charity?.charityName || (user?.charityId ? 'Selected' : 'None')}
              </div>
              <div className="gc-stat-label">Selected charity</div>
            </div>

            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                🛡️
              </div>
              <div className="gc-stat-value">{user?.isAdmin ? 'Admin' : 'Member'}</div>
              <div className="gc-stat-label">Role</div>
            </div>
          </div>

          <div className="gc-stats-grid" style={{ marginTop: 16 }}>
            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                💳
              </div>
              <div className="gc-stat-value">{data?.subscription?.status || 'inactive'}</div>
              <div className="gc-stat-label">{data?.subscription?.plan || 'monthly'} plan</div>
            </div>

            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                ❤️
              </div>
              <div className="gc-stat-value">{data?.charity?.contributionPercent || 10}%</div>
              <div className="gc-stat-label">Charity contribution</div>
            </div>

            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                🎟️
              </div>
              <div className="gc-stat-value">{data?.participation?.drawsEntered || 0}</div>
              <div className="gc-stat-label">Draws entered</div>
            </div>

            <div className="gc-card gc-stat-card">
              <div className="gc-stat-icon" aria-hidden="true">
                🏆
              </div>
              <div className="gc-stat-value">${data?.winnings?.totalWon || 0}</div>
              <div className="gc-stat-label">
                Total won ({data?.winnings?.payoutStatus || 'none'})
              </div>
            </div>
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <div className="gc-page-header" style={{ marginBottom: 12 }}>
              <h2 className="gc-page-title" style={{ fontSize: 24 }}>
                Subscription
              </h2>
            </div>
            <p className="gc-page-sub">
              Status: <strong>{data?.subscription?.status || 'inactive'}</strong> • Plan:{' '}
              <strong>{data?.subscription?.plan || 'monthly'}</strong> • Renewal:{' '}
              {data?.subscription?.renewalDate
                ? new Date(data.subscription.renewalDate).toLocaleDateString()
                : 'N/A'}
            </p>
            <div className="gc-field-row" style={{ marginTop: 8 }}>
              <button
                className="gc-btn gc-btn-outline"
                type="button"
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault()
                  handleCancelSubscription()
                }}
              >
                Cancel
              </button>
              <button
                className="gc-btn gc-btn-primary"
                type="button"
                disabled={submitting}
                onClick={(e) => {
                  e.preventDefault()
                  handleRenewSubscription()
                }}
              >
                Renew
              </button>
            </div>
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <div className="gc-page-header" style={{ marginBottom: 12 }}>
              <h2 className="gc-page-title" style={{ fontSize: 24 }}>
                Latest 5 scores
              </h2>
            </div>

            <form className="gc-form" onSubmit={handleScoreSubmit}>
              <div className="gc-field-row">
                <div className="gc-field">
                  <label htmlFor="score-value">Stableford score (1 - 45)</label>
                  <input
                    id="score-value"
                    className="gc-input"
                    type="number"
                    min={1}
                    max={45}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                  />
                </div>
                <div className="gc-field">
                  <label htmlFor="score-date">Date</label>
                  <input
                    id="score-date"
                    className="gc-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="gc-btn gc-btn-primary" type="submit">
                {scoreSubmitLabel}
              </button>
            </form>

            <div style={{ marginTop: 16 }}>
              {(data?.scores || []).length === 0 ? (
                <p className="gc-auth-footer">No scores yet. Add your latest round.</p>
              ) : (
                <div className="gc-form">
                  {data.scores.map((item) => (
                    <div key={item._id} className="gc-card" style={{ padding: 14 }}>
                      <div className="gc-page-header" style={{ margin: 0 }}>
                        <div>
                          <strong>Score: {item.value}</strong>
                          <p className="gc-page-sub">
                            {new Date(item.playedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="gc-btn gc-btn-outline gc-btn-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            startEdit(item)
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <div className="gc-page-header" style={{ marginBottom: 12 }}>
              <h2 className="gc-page-title" style={{ fontSize: 24 }}>
                Latest Draw Results
              </h2>
            </div>
            {drawNumbers.length ? (
              <>
                <p className="gc-page-sub">
                  Draw numbers: <strong>{drawNumbers.join(', ')}</strong>
                </p>
                <p className="gc-page-sub">
                  You matched <strong>{matchedCount}</strong> numbers.
                </p>
              </>
            ) : (
              <p className="gc-page-sub">No draw published yet.</p>
            )}
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <div className="gc-page-header" style={{ marginBottom: 12 }}>
              <h2 className="gc-page-title" style={{ fontSize: 24 }}>
                Winnings & Proof Upload
              </h2>
            </div>
            {winners.length === 0 ? (
              <p className="gc-page-sub">No winnings yet. Keep playing!</p>
            ) : (
              <div className="gc-form">
                {winners.map((winner) => {
                  const proof = proofInputs[winner._id] || { url: '', note: '' }
                  const hasProof = Boolean(winner.proof?.submittedAt || winner.proof?.url)
                  const statusLabel = winner.payoutStatus === 'paid'
                    ? 'Paid'
                    : winner.payoutStatus === 'rejected'
                      ? 'Rejected'
                      : hasProof
                        ? 'Pending verification'
                        : 'Awaiting proof'
                  return (
                    <div key={winner._id} className="gc-card" style={{ padding: 14 }}>
                      <div className="gc-page-header" style={{ margin: 0 }}>
                        <div>
                          <strong>
                            Match {winner.matchCount} • ${winner.prizeAmount}
                          </strong>
                          <p className="gc-page-sub">Status: {statusLabel}</p>
                        </div>
                      </div>
                      <div className="gc-field">
                        <label>Proof URL (screenshot link)</label>
                        <input
                          className="gc-input"
                          value={proof.url}
                          onChange={(e) =>
                            setProofInputs((prev) => ({
                              ...prev,
                              [winner._id]: { ...proof, url: e.target.value },
                            }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="gc-field">
                        <label>Note (optional)</label>
                        <input
                          className="gc-input"
                          value={proof.note}
                          onChange={(e) =>
                            setProofInputs((prev) => ({
                              ...prev,
                              [winner._id]: { ...proof, note: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <button
                        className="gc-btn gc-btn-primary gc-btn-sm"
                        type="button"
                        disabled={submitting}
                        onClick={(e) => {
                          e.preventDefault()
                          handleProofSubmit(winner._id)
                        }}
                      >
                        Submit proof
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </AsyncContent>
      </div>
    </main>
  )
}
