import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import AsyncContent from '../components/AsyncContent'
import { fetchCharities } from '../features/charity/charitySlice'

export default function Charity() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((s) => s.charity)
  const isLoading = status === 'loading' || status === 'idle'

  useEffect(() => {
    if (status === 'idle') dispatch(fetchCharities())
  }, [dispatch, status])

  return (
    <main className="gc-page">
      <div className="gc-container">
        <AsyncContent
          isLoading={isLoading}
          error={error}
          onRetry={() => dispatch(fetchCharities())}
        >
          <div className="gc-page-header">
            <div>
              <h1 className="gc-page-title">
                Browse <em>Charities</em>
              </h1>
              <p className="gc-page-sub">
                {items.length} {items.length === 1 ? 'charity' : 'charities'} listed
              </p>
            </div>
          </div>

          {status === 'succeeded' && items.length === 0 ? (
            <div className="gc-empty-state">
              No charities available yet.
              <div>
                <button
                  type="button"
                  className="gc-btn gc-btn-outline gc-btn-sm"
                  onClick={() => dispatch(fetchCharities())}
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="gc-grid">
              {items.map((c) => {
                const initial = (c?.name || '?').trim().slice(0, 1).toUpperCase()
                return (
                  <div className="gc-card gc-charity-card" key={c._id}>
                    <div className="gc-charity-initial" aria-hidden="true">
                      {initial}
                    </div>
                    <div className="gc-charity-info">
                      <h3>{c.name}</h3>
                      <p>
                        {c.description ||
                          'Support this charity with every subscription.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </AsyncContent>
      </div>
    </main>
  )
}
