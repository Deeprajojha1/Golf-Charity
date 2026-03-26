# Server

Express API for Golf Charity platform.

## Setup

1. Install dependencies:

npm install

2. Create environment file:

Copy values into .env in this folder.

Required variables:
- PORT=5000
- CLIENT_URL=http://localhost:5173
- MONGO_URI=your_mongodb_connection
- JWT_SECRET=your_secret
- JWT_EXPIRES_IN=7d

3. Run development server:

npm run dev

4. Run production server:

npm start

## Key API groups

- Auth: /api/auth
- User dashboard and scores: /api/user
- Charities: /api/charities
- Draws: /api/draws
- Winners: /api/winners
- Admin: /api/admin
