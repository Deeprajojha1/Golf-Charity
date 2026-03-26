import ErrorState from './ErrorState'
import Loader from './Loader'

export default function AsyncContent({ isLoading, error, onRetry, children }) {
  if (isLoading) return <Loader />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  return children
}

