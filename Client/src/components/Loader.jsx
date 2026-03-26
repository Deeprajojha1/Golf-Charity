export default function Loader({ center = true, label = 'Loading...' }) {
  return (
    <div className={center ? 'gc-center' : undefined} aria-busy="true">
      <div className="gc-loader" role="status" aria-label={label}>
        <div className="gc-spinner" aria-hidden="true" />
        <div className="gc-loader-text">{label}</div>
      </div>
    </div>
  )
}
