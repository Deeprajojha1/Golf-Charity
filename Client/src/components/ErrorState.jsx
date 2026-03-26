export default function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
}) {
  const message =
    error?.userMessage || error?.message || 'Please try again in a moment.'

  return (
    <div className="gc-center" role="alert">
      <div className="gc-card gc-error-card">
        <div className="gc-error-icon" aria-hidden="true">
          !
        </div>
        <div className="gc-error-title">{title}</div>
        <div className="gc-error-message">{message}</div>
        {onRetry ? (
          <div style={{ marginTop: 4 }}>
            <button
              type="button"
              className="gc-btn gc-btn-outline gc-btn-sm"
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
