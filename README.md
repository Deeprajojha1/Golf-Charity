# Golf Charity Subscription Platform (Sample)

This project is a beginner-friendly MERN stack implementation of the PRD you shared.
It includes auth, subscriptions, score tracking, draw engine, charity management, and
admin tools. The server works with MongoDB **or** an in-memory store if `MONGO_URI`
is not provided.

## Quick Start (Local)

1. Backend
```
cd server
npm install
npm run dev
```

2. Frontend
```
cd Client
npm install
npm run dev
```

The client expects the API at `http://localhost:5000`. You can change it with
`VITE_API_URL` in `Client/.env`.

## First Admin User

The first user that signs up becomes an admin automatically. After that, admins
can promote/demote users from the Admin page.

## Main Features (Mapped to PRD)

- Auth (JWT via HttpOnly cookie)
- Subscription (start/renew/cancel)
- Scores (last 5 scores, newest first)
- Monthly Draw (random or weighted)
- Prize Pool (40/35/25 split, 5-match jackpot rollover)
- Charity directory + admin CRUD
- Winner verification + payout tracking
- Admin dashboard and analytics

## Key API Routes

Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

User + Scores
- `GET /api/user/dashboard`
- `PUT /api/user/profile`
- `DELETE /api/user/profile`
- `POST /api/user/scores`
- `PUT /api/user/scores/:scoreId`

Subscription
- `GET /api/subscription/status`
- `POST /api/subscription/start`
- `PUT /api/subscription/renew`
- `PUT /api/subscription/cancel`

Draws + Winners
- `GET /api/draws`
- `GET /api/draws/latest`
- `POST /api/draws/simulate` (admin)
- `POST /api/draws/publish` (admin)
- `DELETE /api/draws/:drawId` (admin)
- `GET /api/winners/me`
- `POST /api/winners/:winnerId/proof`
- `GET /api/winners` (admin)
- `PUT /api/winners/:winnerId/decision` (admin)
- `PUT /api/winners/:winnerId/pay` (admin)
- `DELETE /api/winners/:winnerId` (admin)

Admin
- `GET /api/admin/summary`
- `GET /api/admin/users`
- `PUT /api/admin/users/:userId`
- `DELETE /api/admin/users/:userId`
- `POST /api/admin/charities`
- `PUT /api/admin/charities/:charityId`
- `DELETE /api/admin/charities/:charityId`

## Notes

- If `MONGO_URI` is not set, the backend falls back to an in-memory store.
- Prize pool uses a fixed percentage of active subscriptions (see `server/utils/constants.js`).
- Draw matching uses each user's latest 5 Stableford scores as their entry numbers.
