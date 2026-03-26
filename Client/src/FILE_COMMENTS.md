# Frontend File Comments

- main.jsx: React app entry point; wraps app with Redux Provider and BrowserRouter.
- App.jsx: Top-level app shell that wires routes and shared layout.
- App.css: App-level styling for forms, cards, buttons, and page sections.
- index.css: Global theme, typography, spacing, and responsive utility styles.

## app
- app/store.js: Configures Redux store and registers all feature reducers.
- app/hooks.js: Shared React-Redux hooks used across UI.

## components
- components/AsyncContent.jsx: Standard wrapper for loading/error/content rendering states.
- components/ErrorState.jsx: Reusable error UI block with message display.
- components/Loader.jsx: Reusable loading indicator/spinner component.
- components/Navbar.jsx: Main navigation bar with auth/admin links and mobile toggle.
- components/ProtectedRoute.jsx: Route guard that redirects unauthenticated users.

## features/auth
- features/auth/authAPI.js: API calls for login, register, logout, and profile auth actions.
- features/auth/authSlice.js: Auth state management with async thunk handling.

## features/charity
- features/charity/charityAPI.js: API helper to fetch charities from backend.
- features/charity/charitySlice.js: Charity list state and request status handling.

## features/dashboard
- features/dashboard/dashboardAPI.js: Dashboard-specific API requests (scores/profile widgets).
- features/dashboard/dashboardSlice.js: Dashboard state for stats, scores, and user data.

## pages
- pages/Home.jsx: Landing page with primary CTA and product overview content.
- pages/Login.jsx: Login form page with validation and toast-based error handling.
- pages/Register.jsx: Registration form page including charity selection.
- pages/Dashboard.jsx: User dashboard for scores, subscription, and winnings/proof flow.
- pages/Charity.jsx: Charity selection/listing page and related interactions.
- pages/Admin.jsx: Admin panel for draw publishing, winner decisions, and payouts.
- pages/NotFound.jsx: 404 fallback page for unknown routes.

## services
- services/axios.js: Central Axios instance (base URL, credentials, interceptors).
- services/adminAPI.js: Admin endpoints for moderation/workflow actions.
- services/drawAPI.js: Draw-related API calls.
- services/subscriptionAPI.js: Subscription plan/status API calls.
- services/winnerAPI.js: Winner proof/decision/payment API calls.
