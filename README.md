# TaskMaster AI

AI-powered task management app built for the Codezyng fullstack assignment, using the "AI-Powered Task Manager" option.

## Features

- Email/password authentication with JWT
- User-isolated task CRUD
- Task categories, priority, due dates, reminders, status filters, search, and smart search
- Kanban board with drag and drop
- Calendar view for due dates
- Analytics dashboard with Recharts
- Supabase realtime updates for task/subtask changes
- AI features:
  - Natural language task creation
  - Smart task breakdown into subtasks
  - Priority prediction
  - Time estimation
  - Daily summary generation
- Dark mode, profile page, CSV/PDF export

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios
- UI libraries: Recharts, React Big Calendar, `@hello-pangea/dnd`
- Backend: Node.js, Express
- Database/realtime: Supabase Postgres and Supabase Realtime
- Auth: JWT plus bcrypt password hashing
- AI: Gemini Flash by default, with OpenAI fallback support

## Project Structure

```text
codezyng/
  backend/
    config/          Supabase and DB clients
    controllers/     HTTP request handlers
    db/              Database initialization
    middleware/      JWT auth middleware
    models/          Supabase data access
    routes/          Express routes
    services/        AI task service
    server.js
  frontend/
    src/
      components/    Reusable UI components
      hooks/         Realtime hooks
      pages/         App pages
      services/      API and Supabase clients
      utils/         Export helpers
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-or-publishable-key
SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:6543/postgres
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

Create `frontend/.env.local` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Do not commit real `.env` files or private API keys.

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
node db/initialize.js
npm run dev
```

Install frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Database Setup

`backend/db/initialize.js` creates the required tables and indexes:

- `users`
- `tasks`
- `subtasks`
- `task_templates`

It also enables Supabase Realtime publication for `tasks` and `subtasks` and sets replica identity to support update/delete payloads.

## Main API Routes

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/ai-generate`
- `POST /api/tasks/:id/breakdown`
- `POST /api/tasks/ai/priority-prediction`
- `POST /api/tasks/ai/smart-search`
- `GET /api/tasks/stats/dashboard`

## Deployment Guide

Backend deployment:

1. Deploy `backend/` to Render, Railway, or another Node host.
2. Add all backend environment variables.
3. Run `node db/initialize.js` once against the production Supabase project.
4. Start with `npm start`.

Frontend deployment:

1. Deploy `frontend/` to Vercel, Netlify, or another static host.
2. Set `VITE_API_URL` to the deployed backend `/api` URL.
3. Set Supabase realtime variables.
4. Build with `npm run build`.

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for architecture decisions, AI tool usage, and trade-offs made for the assignment.
