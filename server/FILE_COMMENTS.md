# Backend File Comments

- server.js: Express app bootstrap; loads env, middleware, routes, DB connect, and starts server.

## config
- config/db.js: MongoDB connection helper for initializing Mongoose.

## controllers
- controllers/authController.js: Register/login/logout/profile auth logic with cookie/JWT handling.
- controllers/charityController.js: Charity listing/seed/fetch logic.
- controllers/userController.js: User dashboard, profile updates, and score CRUD handlers.
- controllers/subscriptionController.js: Subscription status/plan update business logic.
- controllers/drawController.js: Draw publish/run endpoints and draw workflow logic.
- controllers/winnerController.js: Winner proof submission, approval/rejection, and payout flow.
- controllers/adminController.js: Admin analytics and privileged management endpoints.

## middleware
- middleware/authMiddleware.js: Auth guard and role checks from JWT/cookies.
- middleware/errorMiddleware.js: Centralized API error formatting and response handling.

## models
- models/User.js: User schema with auth, subscription, score, and winnings fields.
- models/Charity.js: Charity schema and metadata fields.
- models/Draw.js: Draw schema for run metadata and selection details.
- models/Winner.js: Winner schema for result, proof, decision, and payout states.

## routes
- routes/authRoutes.js: Auth route definitions mapped to auth controller methods.
- routes/charityRoutes.js: Charity route definitions.
- routes/userRoutes.js: Protected user dashboard/profile/score routes.
- routes/subscriptionRoutes.js: Subscription route definitions.
- routes/drawRoutes.js: Draw publish/list route definitions.
- routes/winnerRoutes.js: Winner lifecycle route definitions.
- routes/adminRoutes.js: Admin-only route definitions.

## services
- services/memoryStore.js: In-memory fallback store when DB is unavailable.

## utils
- utils/generateToken.js: JWT token generation utility.
- utils/constants.js: Shared constants used by business logic.
- utils/drawEngine.js: Draw winner-selection logic utilities.

## scripts
- scripts/promoteDemoAdmin.js: Marks a demo account as admin for testing.
- scripts/createDemoWinnerFlow.js: Seeds a sample draw/winner flow for local demos.
