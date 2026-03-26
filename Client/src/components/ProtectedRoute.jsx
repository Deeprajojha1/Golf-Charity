import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import Loader from './Loader'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, hydrated, status } = useAppSelector((s) => s.auth)
  const location = useLocation()
  if (!hydrated || status === 'loading') return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }
  return <Outlet />
}
