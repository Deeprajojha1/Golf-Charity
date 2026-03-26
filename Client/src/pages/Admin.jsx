import { useEffect, useMemo, useState } from 'react'
import AsyncContent from '../components/AsyncContent'
import { adminAPI } from '../services/adminAPI'
import { charityAPI } from '../features/charity/charityAPI'
import { drawAPI } from '../services/drawAPI'
import { winnerAPI } from '../services/winnerAPI'
import { toast } from 'react-hot-toast'

const emptyCharity = {
  name: '',
  description: '',
  tags: '',
  featured: false,
}

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [simulation, setSimulation] = useState(null)
  const [logicType, setLogicType] = useState('random')

  const [charityForm, setCharityForm] = useState(emptyCharity)
  const [editingCharityId, setEditingCharityId] = useState(null)
  const [editingScore, setEditingScore] = useState({ userId: null, scoreId: null })
  const [scoreDrafts, setScoreDrafts] = useState({})
  const [newScoreDrafts, setNewScoreDrafts] = useState({})

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [summaryRes, usersRes, charitiesRes, drawsRes, winnersRes] = await Promise.all(
        [
          adminAPI.summary(),
          adminAPI.listUsers(),
          charityAPI.list(),
          drawAPI.list(),
          winnerAPI.listAll(),
        ],
      )
      setSummary(summaryRes.summary)
      setUsers(usersRes.users || [])
      setCharities(charitiesRes.charities || [])
      setDraws(drawsRes.draws || [])
      setWinners(winnersRes.winners || [])
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const prevent = (handler) => (event) => {
    event.preventDefault()
    handler()
  }

  useEffect(() => {
    loadAll()
  }, [])

  const resetCharityForm = () => {
    setCharityForm(emptyCharity)
    setEditingCharityId(null)
  }

  const handleCharitySubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: charityForm.name.trim(),
      description: charityForm.description.trim(),
      tags: charityForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      featured: charityForm.featured,
    }
    if (!payload.name) return

    try {
      if (editingCharityId) {
        await adminAPI.updateCharity(editingCharityId, payload)
        toast.success('Charity updated')
      } else {
        await adminAPI.createCharity(payload)
        toast.success('Charity added')
      }
      resetCharityForm()
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Charity action failed')
    }
  }

  const onEditCharity = (charity) => {
    setEditingCharityId(charity._id)
    setCharityForm({
      name: charity.name || '',
      description: charity.description || '',
      tags: (charity.tags || []).join(', '),
      featured: Boolean(charity.featured),
    })
  }

  const onDeleteCharity = async (charityId) => {
    if (!window.confirm('Delete this charity?')) return
    try {
      await adminAPI.deleteCharity(charityId)
      toast.success('Charity deleted')
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Delete failed')
    }
  }

  const handleSimulation = async () => {
    try {
      const res = await drawAPI.simulate(logicType)
      setSimulation(res.simulation)
      toast.success('Simulation completed')
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Simulation failed')
    }
  }

  const handlePublish = async () => {
    if (!window.confirm('Publish this month draw?')) return
    try {
      await drawAPI.publish(logicType)
      toast.success('Draw published')
      setSimulation(null)
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Publish failed')
    }
  }

  const handleWinnerDecision = async (winnerId, decision) => {
    try {
      await winnerAPI.decide(winnerId, { decision })
      toast.success(`Winner ${decision}d`)
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Decision failed')
    }
  }

  const handleWinnerPaid = async (winnerId) => {
    try {
      await winnerAPI.markPaid(winnerId)
      toast.success('Marked as paid')
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Mark paid failed')
    }
  }

  const toggleAdmin = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isAdmin: !user.isAdmin })
      toast.success('Role updated')
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Update failed')
    }
  }

  const deactivateUser = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { subscriptionStatus: 'inactive' })
      toast.success('User deactivated')
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Deactivate failed')
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await adminAPI.deleteUser(userId)
      toast.success('User deleted')
      await loadAll()
    } catch (err) {
      setError(err)
      toast.error(err?.message || 'Delete failed')
    }
  }

  const setDraft = (userId, scoreId, field, value) => {
    const key = `${userId}:${scoreId}`
    setScoreDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }))
  }

  const setNewDraft = (userId, field, value) => {
    setNewScoreDrafts((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [field]: value },
    }))
  }

  const handleSaveScore = async (userId, scoreId) => {
    const key = `${userId}:${scoreId}`
    const draft = scoreDrafts[key]
    if (!draft?.value || !draft?.date) return
    try {
      await adminAPI.updateUserScore(userId, scoreId, {
        score: Number(draft.value),
        date: draft.date,
      })
      toast.success('Score updated')
      setEditingScore({ userId: null, scoreId: null })
      await loadAll()
    } catch (err) {
      toast.error(err?.message || 'Score update failed')
    }
  }

  const handleAddScore = async (userId) => {
    const draft = newScoreDrafts[userId]
    if (!draft?.value || !draft?.date) return
    try {
      await adminAPI.addUserScore(userId, {
        score: Number(draft.value),
        date: draft.date,
      })
      toast.success('Score added')
      setNewScoreDrafts((prev) => ({ ...prev, [userId]: { value: '', date: '' } }))
      await loadAll()
    } catch (err) {
      toast.error(err?.message || 'Add score failed')
    }
  }

  const latestDraw = useMemo(() => draws?.[0], [draws])

  return (
    <main className="gc-page">
      <div className="gc-container">
        <AsyncContent isLoading={loading} error={error} onRetry={loadAll}>
          <div className="gc-page-header">
            <div>
              <h1 className="gc-page-title">
                Admin <em>Control Room</em>
              </h1>
              <p className="gc-page-sub">Run draws, manage users, and track impact.</p>
            </div>
          </div>

          <div className="gc-stats-grid">
            <div className="gc-card gc-stat-card">
              <div className="gc-stat-value">{summary?.totalUsers || 0}</div>
              <div className="gc-stat-label">Total users</div>
            </div>
            <div className="gc-card gc-stat-card">
              <div className="gc-stat-value">{summary?.activeSubscribers || 0}</div>
              <div className="gc-stat-label">Active subscribers</div>
            </div>
            <div className="gc-card gc-stat-card">
              <div className="gc-stat-value">${summary?.prizePoolTotal || 0}</div>
              <div className="gc-stat-label">Current prize pool</div>
            </div>
            <div className="gc-card gc-stat-card">
              <div className="gc-stat-value">${summary?.charityContributionTotal || 0}</div>
              <div className="gc-stat-label">Charity contributions</div>
            </div>
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <h2 className="gc-page-title" style={{ fontSize: 22 }}>
              Monthly Draw Engine
            </h2>
            <div className="gc-field-row gc-field-row-top">
              <div className="gc-field">
                <label htmlFor="logicType">Draw logic</label>
                <select
                  id="logicType"
                  className="gc-input gc-select"
                  value={logicType}
                  onChange={(e) => setLogicType(e.target.value)}
                >
                  <option value="random">Random</option>
                  <option value="weighted">Weighted (score frequency)</option>
                </select>
              </div>
              <div className="gc-field gc-field-actions">
                <label>Actions</label>
                <div className="gc-admin-actions">
                  <button className="gc-btn gc-btn-outline" type="button" onClick={prevent(handleSimulation)}>
                    Simulate
                  </button>
                  <button className="gc-btn gc-btn-primary" type="button" onClick={prevent(handlePublish)}>
                    Publish draw
                  </button>
                </div>
              </div>
            </div>

            {simulation ? (
              <div className="gc-card" style={{ marginTop: 12 }}>
                <strong>Simulation</strong>
                <p className="gc-page-sub">
                  Numbers: {simulation.numbers?.join(', ')} | Pool: ${simulation.pool?.total || 0}
                </p>
                <p className="gc-page-sub">
                  Winners: 5-match {simulation.winners?.match5 || 0}, 4-match{' '}
                  {simulation.winners?.match4 || 0}, 3-match {simulation.winners?.match3 || 0}
                </p>
              </div>
            ) : null}

            {latestDraw ? (
              <div className="gc-card" style={{ marginTop: 12 }}>
                <strong>Latest draw ({latestDraw.monthKey})</strong>
                <p className="gc-page-sub">Numbers: {latestDraw.numbers?.join(', ')}</p>
                <p className="gc-page-sub">
                  Pool total: ${latestDraw.prizePoolTotal || 0} | Rollover:{' '}
                  ${latestDraw.prizePoolBreakdown?.rollover || 0}
                </p>
              </div>
            ) : (
              <p className="gc-page-sub" style={{ marginTop: 12 }}>
                No draws yet.
              </p>
            )}
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <h2 className="gc-page-title" style={{ fontSize: 22 }}>
              Charity Directory
            </h2>
            <form className="gc-form" onSubmit={handleCharitySubmit}>
              <div className="gc-field-row">
                <div className="gc-field">
                  <label>Name</label>
                  <input
                    className="gc-input"
                    value={charityForm.name}
                    onChange={(e) => setCharityForm({ ...charityForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="gc-field">
                  <label>Tags (comma)</label>
                  <input
                    className="gc-input"
                    value={charityForm.tags}
                    onChange={(e) => setCharityForm({ ...charityForm, tags: e.target.value })}
                  />
                </div>
              </div>
              <div className="gc-field">
                <label>Description</label>
                <textarea
                  className="gc-input"
                  rows={3}
                  value={charityForm.description}
                  onChange={(e) =>
                    setCharityForm({ ...charityForm, description: e.target.value })
                  }
                />
              </div>
              <label className="gc-checkbox">
                <input
                  type="checkbox"
                  checked={charityForm.featured}
                  onChange={(e) =>
                    setCharityForm({ ...charityForm, featured: e.target.checked })
                  }
                />
                Feature on homepage
              </label>
              <div className="gc-field-row">
                <button className="gc-btn gc-btn-primary" type="submit">
                  {editingCharityId ? 'Update charity' : 'Add charity'}
                </button>
                {editingCharityId ? (
                  <button
                    className="gc-btn gc-btn-outline"
                    type="button"
                    onClick={resetCharityForm}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="gc-grid" style={{ marginTop: 12 }}>
              {charities.map((charity) => (
                <div className="gc-card gc-charity-card" key={charity._id}>
                  <div className="gc-charity-info">
                    <h3>{charity.name}</h3>
                    <p>{charity.description}</p>
                  </div>
                  <div className="gc-charity-actions">
                    <button
                      className="gc-btn gc-btn-outline gc-btn-sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        onEditCharity(charity)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="gc-btn gc-btn-outline gc-btn-sm"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        onDeleteCharity(charity._id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <h2 className="gc-page-title" style={{ fontSize: 22 }}>
              Winner Verification
            </h2>
            {winners.length === 0 ? (
              <p className="gc-page-sub">No winners yet.</p>
            ) : (
              <div className="gc-form">
                {winners.map((winner) => (
                  <div key={winner._id} className="gc-card" style={{ padding: 14 }}>
                    <div className="gc-page-header" style={{ margin: 0 }}>
                      <div>
                        <strong>
                          Match {winner.matchCount} • ${winner.prizeAmount}
                        </strong>
                        <p className="gc-page-sub">
                          Status: {winner.payoutStatus}
                        </p>
                      </div>
                      <div className="gc-winner-actions">
                        <button
                          className="gc-btn gc-btn-outline gc-btn-sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleWinnerDecision(winner._id, 'approve')
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="gc-btn gc-btn-outline gc-btn-sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleWinnerDecision(winner._id, 'reject')
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="gc-btn gc-btn-primary gc-btn-sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleWinnerPaid(winner._id)
                          }}
                        >
                          Mark paid
                        </button>
                      </div>
                    </div>
                    {winner.proof?.url ? (
                      <p className="gc-page-sub" style={{ marginTop: 6 }}>
                        Proof: {winner.proof.url}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="gc-card" style={{ marginTop: 16 }}>
            <h2 className="gc-page-title" style={{ fontSize: 22 }}>
              Users & Subscriptions
            </h2>
            <div className="gc-form">
              {users.map((u) => (
                <div key={u._id} className="gc-card" style={{ padding: 14 }}>
                  <div className="gc-page-header" style={{ margin: 0 }}>
                    <div>
                      <strong>{u.name}</strong>
                      <p className="gc-page-sub">
                        {u.email} • {u.subscriptionStatus} • {u.subscriptionPlan} •
                        requested: {u.requestedRole || 'subscriber'}
                      </p>
                    </div>
                    <div className="gc-user-actions">
                      <button
                        className="gc-btn gc-btn-outline gc-btn-sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleAdmin(u)
                        }}
                      >
                        {u.isAdmin ? 'Remove admin' : 'Make admin'}
                      </button>
                      <button
                        className="gc-btn gc-btn-outline gc-btn-sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          deactivateUser(u)
                        }}
                      >
                        Deactivate
                      </button>
                      <button
                        className="gc-btn gc-btn-outline gc-btn-sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          deleteUser(u._id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="gc-card" style={{ marginTop: 12, padding: 12 }}>
                    <div className="gc-page-header" style={{ marginBottom: 8 }}>
                      <strong>Golf scores</strong>
                      <span className="gc-page-sub">Admin can edit last 5 scores</span>
                    </div>
                    <div className="gc-form" style={{ gap: 10 }}>
                      {(u.scores || []).length === 0 ? (
                        <p className="gc-page-sub">No scores yet.</p>
                      ) : (
                        u.scores.map((score) => {
                          const key = `${u._id}:${score._id}`
                          const draft = scoreDrafts[key] || {
                            value: score.value,
                            date: new Date(score.playedAt).toISOString().slice(0, 10),
                          }
                          const isEditing =
                            editingScore.userId === u._id && editingScore.scoreId === score._id
                          return (
                            <div key={score._id} className="gc-field-row gc-score-row">
                              <div className="gc-field">
                                <label>Score</label>
                                <input
                                  className="gc-input"
                                  type="number"
                                  min={1}
                                  max={45}
                                  value={draft.value}
                                  onChange={(e) =>
                                    setDraft(u._id, score._id, 'value', e.target.value)
                                  }
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="gc-field">
                                <label>Date</label>
                                <input
                                  className="gc-input"
                                  type="date"
                                  value={draft.date}
                                  onChange={(e) =>
                                    setDraft(u._id, score._id, 'date', e.target.value)
                                  }
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="gc-user-actions">
                                {isEditing ? (
                                  <>
                                    <button
                                      className="gc-btn gc-btn-primary gc-btn-sm"
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleSaveScore(u._id, score._id)
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="gc-btn gc-btn-outline gc-btn-sm"
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        setEditingScore({ userId: null, scoreId: null })
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="gc-btn gc-btn-outline gc-btn-sm"
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setEditingScore({ userId: u._id, scoreId: score._id })
                                    }}
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    <div className="gc-field-row gc-score-row" style={{ marginTop: 10 }}>
                      <div className="gc-field">
                        <label>New score</label>
                        <input
                          className="gc-input"
                          type="number"
                          min={1}
                          max={45}
                          value={newScoreDrafts[u._id]?.value || ''}
                          onChange={(e) => setNewDraft(u._id, 'value', e.target.value)}
                        />
                      </div>
                      <div className="gc-field">
                        <label>Date</label>
                        <input
                          className="gc-input"
                          type="date"
                          value={newScoreDrafts[u._id]?.date || ''}
                          onChange={(e) => setNewDraft(u._id, 'date', e.target.value)}
                        />
                      </div>
                      <div className="gc-user-actions">
                        <button
                          className="gc-btn gc-btn-primary gc-btn-sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddScore(u._id)
                          }}
                        >
                          Add score
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AsyncContent>
      </div>
    </main>
  )
}
