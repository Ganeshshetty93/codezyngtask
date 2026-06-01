# TaskMaster AI Documentation

## Architecture Decisions

### Why This Stack

I chose React, Vite, Tailwind CSS, Express, and Supabase because the assignment rewards a working fullstack product over unnecessary complexity. React and Vite make the frontend fast to build and easy to deploy as static assets. Tailwind keeps the UI consistent without introducing a large design system. Express is simple, explicit, and well-suited for a task-focused REST API. Supabase provides managed Postgres plus realtime updates, which fits the requirement for user-owned task data and the optional realtime bonus.

The AI layer is isolated in `backend/services/aiTaskService.js` so prompts, provider calls, JSON parsing, and fallbacks are not mixed into route handlers. Gemini Flash is the default provider for speed and cost, with OpenAI-compatible support retained as a fallback path.

### Database Schema and Rationale

The core schema is intentionally small:

- `users`: stores authentication identity, hashed password, role, and profile data.
- `tasks`: stores user-owned task records with title, description, category, priority, status, due date, reminder time, and effort estimates.
- `subtasks`: stores AI-generated or manual subtasks linked to a parent task.
- `task_templates`: reserved for reusable AI suggestions and future template workflows.

Each task belongs to a user through `tasks.user_id`, and subtasks are cascade-deleted with their parent task. Indexes on `user_id`, `status`, `priority`, `category`, and `task_id` support the dashboard filters and common lookups.

Supabase Realtime is enabled for `tasks` and `subtasks`. `REPLICA IDENTITY FULL` is used so update/delete events include enough row data for the frontend to decide whether the current user should refresh.

### Authentication and Session Management

Authentication uses email/password registration and login. Passwords are hashed with bcrypt before storage. On successful login/register, the backend issues a JWT containing the user id and role. The frontend stores the token in `localStorage` and sends it through the Axios authorization interceptor.

Protected backend routes use JWT middleware to populate `req.user`. Task APIs always use `req.user.id`, so users only query and mutate their own tasks. The frontend also redirects unauthenticated users to login.

### API Design Choices

The API is REST-oriented because the product domain is straightforward and maps naturally to resources:

- `/api/users/*` for authentication and profile updates
- `/api/tasks/*` for task CRUD, filters, analytics, and AI actions

AI endpoints are separated from normal CRUD endpoints. This keeps deterministic task operations predictable while allowing AI workflows to return richer responses or fallback results.

Validation is handled on both frontend and backend. Backend validation is the source of truth for required fields, allowed statuses/priorities, dates, and ownership.

### AI Integration Approach

AI features are implemented server-side so API keys are never exposed to the browser. The service prompts models to return strict JSON for structured features such as natural-language task creation, task breakdown, priority prediction, smart search, and daily summary.

Because AI output can be inconsistent or rate-limited, the service includes defensive JSON extraction, provider-specific handling, and local fallback logic. This keeps the app usable even when an AI provider returns malformed text or rate-limit errors.

## AI Tool Usage

### Tools Used

AI coding assistance was used through ChatGPT/Codex-style workflows to speed up implementation, debugging, refactoring, and documentation. AI was most useful for generating boilerplate, comparing implementation options, and quickly iterating UI improvements.

### Effective AI Assistance Examples

- Refactored repeated dashboard UI into reusable components.
- Added AI feature fallbacks for priority, estimation, breakdown, smart search, and daily summary.
- Diagnosed realtime setup gaps by checking frontend subscription code and Supabase publication state.
- Improved validation and error handling across task creation and editing.

### Where AI Suggestions Were Overridden

Some AI-generated suggestions were intentionally simplified. For example, the export-to-PDF feature uses a browser print document instead of adding a heavy PDF dependency. The app also uses REST endpoints rather than GraphQL because the assignment scope is better served by clear, inspectable routes.

I also rejected broad rewrites in favor of incremental fixes, because preserving working auth, data isolation, and task flows was more important than introducing new abstractions late in the build.

## Trade-offs Made

### Prioritized Given Time Constraints

- Working end-to-end authentication and user-isolated tasks
- Reliable AI features with fallbacks
- Clean dashboard, Kanban, filtering, and analytics workflows
- Supabase Realtime verification
- Clear setup/deployment documentation

### Improvements With More Time

- Add automated integration tests for auth, task CRUD, and AI fallbacks
- Add refresh-token/session rotation instead of relying only on long-lived JWTs
- Add row-level security policies in Supabase as defense in depth
- Add server-side pagination for very large task lists
- Add background jobs for reminders and notification delivery
- Split frontend bundles with route-level lazy loading

### Production Considerations Addressed or Skipped

Addressed:

- API keys stay on the server
- Passwords are hashed
- JWT auth protects task routes
- Task queries are scoped by authenticated user
- Frontend and backend validation are present
- AI failures fall back to deterministic behavior where practical
- Realtime tables are explicitly enabled

Skipped or partial:

- Full automated test suite
- CI/CD pipeline
- Advanced observability and alerting
- Supabase RLS policies
- Payment-grade security hardening
