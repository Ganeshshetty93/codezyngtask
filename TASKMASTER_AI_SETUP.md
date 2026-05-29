╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                   TASKMASTER AI - COMPLETE SETUP GUIDE                       ║
║                                                                               ║
║              AI-Powered Task Management Application                          ║
║              React + Express + PostgreSQL + OpenAI                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🎯 PROJECT OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TaskMaster AI is a complete task management application with intelligent features:

✅ User Authentication (Email/Password)
✅ Complete Task CRUD Operations
✅ AI-Powered Features:
   • Smart Task Breakdown (Epic → Subtasks)
   • Automatic Priority Suggestions
   • Time Estimation Assistance
   • Natural Language Task Creation
   • Smart Task Suggestions
✅ Task Organization (Categories, Filtering)
✅ Real-time Statistics & Dashboard
✅ PostgreSQL Database (via Supabase)
✅ Modern UI (React + Tailwind CSS + Vite)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PREREQUISITES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Supabase Account (https://supabase.com)
   • Creates PostgreSQL database
   • Provides connection details

2. OpenAI API Key (https://platform.openai.com/api-keys)
   • For AI task intelligence features
   • Free tier available ($5 credit)

3. Node.js & npm installed
   • Already done: ✅

4. Git & GitHub (optional, for deployment)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: GET SUPABASE DATABASE CONNECTION STRING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to Supabase Dashboard (https://app.supabase.com)
2. Select your project
3. Click Settings → Database
4. Under "Connection pooling", copy the connection string:
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

Example:
   postgresql://postgres:aBcD1234EfGh@pfqrvqayboguojwtyukf.supabase.co:5432/postgres

Note: Replace [PASSWORD] with your database password (set during project creation)

If you forgot password:
   1. Go to Settings → Users
   2. Find user "postgres"
   3. Click "Reset password"
   4. Check email for new password

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: GET OPENAI API KEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key
4. Save it somewhere safe (you won't see it again)

Free Trial:
   • $5 credit for new users
   • Expires after 3 months
   • Use GPT-3.5-turbo (cheapest option)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: UPDATE BACKEND ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Edit: c:\Projects\codezyng\backend\.env

Update with your credentials:

PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_12345
NODE_ENV=development
SUPABASE_URL=https://pfqrvqayboguojwtyukf.supabase.co
SUPABASE_KEY=sb_publishable_9gx92HGMcxWZw35SXaTEJg_qcajae7f
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@pfqrvqayboguojwtyukf.supabase.co:5432/postgres
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_KEY_HERE

Save the file!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: INSTALL DEPENDENCIES & CREATE TABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open PowerShell and run:

cd c:\Projects\codezyng\backend

npm install pg openai axios

(If already installed, you'll see "up to date")

Then create tables by running:

node db/initialize.js

Expected output:
   ✓ Users table created
   ✓ Tasks table created
   ✓ Subtasks table created
   ✓ Task templates table created
   ✓ Indexes created
   
   ✅ All tables created successfully!

If you get connection errors:
   • Double-check SUPABASE_DB_URL in .env
   • Make sure password is correct
   • Try resetting database password in Supabase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: START BACKEND SERVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cd c:\Projects\codezyng\backend

npm run dev

Expected output:
   ✓ PostgreSQL pool connected to Supabase
   ✓ Users table created
   ✓ Tasks table created
   ✓ Subtasks table created
   ✓ Task templates table created
   ✓ Indexes created
   
   ✅ Database initialized successfully
   
   ╔════════════════════════════════════╗
   ║   TaskMaster AI Server Running    ║
   ║   Port: 5000                       ║
   ║   Environment: development         ║
   ╚════════════════════════════════════╝

If tables already exist, you'll see:
   ✅ Database initialized successfully
   (No errors - that's good!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: VERIFY FRONTEND IS RUNNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open new PowerShell window and run:

cd c:\Projects\codezyng\frontend

npm run dev

Expected output:
   Local:        http://localhost:3000/

If frontend isn't running, start it now.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: TEST THE APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open browser to http://localhost:3000
2. You should see the login/register page

TEST REGISTRATION:
   • Click "Register"
   • Fill in: name, email, password
   • Click "Sign Up"
   • Should redirect to dashboard

TEST LOGIN:
   • Click "Login"
   • Use registered email & password
   • Should redirect to dashboard

TEST TASK CREATION:
   • Click "Add Task"
   • Enter task title and description
   • Check "Use AI" checkbox to get:
     - Suggested priority
     - Time estimation
   • Click "Create Task"
   • Task should appear in list

TEST NATURAL LANGUAGE:
   • Click "Quick Add"
   • Say: "Plan my product launch for next month"
   • AI will:
     - Parse the text
     - Create task
     - Break into subtasks
     - Estimate time
   • Click "Create"

TEST FILTERING:
   • Filter by: Status, Category, Priority
   • See upcoming tasks
   • See overdue tasks
   • View statistics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

API ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTHENTICATION:
  POST   /api/users/register         Register new user
  POST   /api/users/login            Login (returns JWT token)

TASK OPERATIONS:
  GET    /api/tasks                  Get all tasks
  POST   /api/tasks                  Create task
  GET    /api/tasks/:id              Get task by ID
  PUT    /api/tasks/:id              Update task
  DELETE /api/tasks/:id              Delete task

AI FEATURES:
  POST   /api/tasks/natural-language/create    Create from natural language
  POST   /api/tasks/:id/breakdown               Break down into subtasks
  GET    /api/tasks/ai/suggestions              Get AI suggestions

FILTERING & ORGANIZATION:
  GET    /api/tasks/status/:status   Get tasks by status (todo, in_progress, done)
  GET    /api/tasks/category/:category  Get tasks by category
  GET    /api/tasks/upcoming/all      Get upcoming tasks
  GET    /api/tasks/overdue/all       Get overdue tasks

ANALYTICS:
  GET    /api/tasks/stats/dashboard   Get task statistics
  GET    /api/health                   Check API status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USERS TABLE:
  id (UUID)
  email (VARCHAR, unique)
  password (VARCHAR, hashed)
  name (VARCHAR)
  avatar_url (VARCHAR)
  oauth_provider (VARCHAR)
  oauth_id (VARCHAR)
  created_at (TIMESTAMP)
  updated_at (TIMESTAMP)

TASKS TABLE:
  id (UUID)
  user_id (UUID, FK → users)
  title (VARCHAR)
  description (TEXT)
  category (VARCHAR)
  status (VARCHAR: todo, in_progress, done)
  priority (VARCHAR: low, medium, high)
  due_date (TIMESTAMP)
  estimated_hours (DECIMAL)
  actual_hours (DECIMAL)
  created_at (TIMESTAMP)
  updated_at (TIMESTAMP)

SUBTASKS TABLE:
  id (UUID)
  task_id (UUID, FK → tasks)
  title (VARCHAR)
  status (VARCHAR)
  order_index (INTEGER)
  created_at (TIMESTAMP)
  updated_at (TIMESTAMP)

TASK_TEMPLATES TABLE:
  id (UUID)
  user_id (UUID, FK → users)
  name (VARCHAR)
  description (TEXT)
  suggested_subtasks (JSONB)
  suggested_priority (VARCHAR)
  estimated_hours (DECIMAL)
  created_at (TIMESTAMP)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: "Database connection failed"
Solution:
  1. Check SUPABASE_DB_URL in .env
  2. Verify password is correct
  3. Ensure SSL is rejectUnauthorized: false
  4. Try resetting password in Supabase Settings

Problem: "OpenAI API error"
Solution:
  1. Verify OPENAI_API_KEY is correct
  2. Check if you have credit (OpenAI dashboard)
  3. Ensure key starts with "sk-"
  4. Verify API is enabled for your account

Problem: "Task creation fails"
Solution:
  1. Verify you're logged in (check JWT token)
  2. Check backend console for error details
  3. Verify all required fields are provided
  4. Check SUPABASE_DB_URL has correct password

Problem: "Frontend can't connect to backend"
Solution:
  1. Verify backend is running on port 5000
  2. Check frontend .env has correct API URL
  3. Verify CORS is enabled in Express
  4. Check browser console for specific errors

Problem: "AI features not working"
Solution:
  1. Verify OPENAI_API_KEY is set
  2. Check OpenAI account has credit
  3. Look for error in backend console
  4. Ensure request includes auth token

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEATURES BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ AUTHENTICATION
  • Email/password registration
  • Secure login with JWT tokens
  • Token stored in localStorage
  • Automatic token refresh (optional)
  • OAuth ready (structure in place)

✨ TASK MANAGEMENT
  • Create/read/update/delete tasks
  • Set priority (low/medium/high)
  • Assign due dates
  • Track time (estimated vs actual)
  • Mark status (todo/in_progress/done)
  • Organize by category

✨ AI FEATURES
  • Natural Language Task Creation
    - Say: "Launch product next week"
    - AI parses and creates task automatically
  
  • Smart Task Breakdown
    - Splits epic into subtasks
    - Creates actionable checklist
    - Example: "Build website" → [Design, Frontend, Backend, Deploy]
  
  • Automatic Priority Suggestion
    - Analyzes task description
    - Suggests: low, medium, or high
    - Based on urgency and complexity
  
  • Time Estimation
    - Estimates hours to complete
    - Uses task context
    - Helps with planning
  
  • Smart Suggestions
    - Analyzes your task history
    - Suggests related tasks
    - Helps discover gaps in planning

✨ ORGANIZATION & FILTERING
  • Filter by status (todo, in progress, done)
  • Filter by category (work, personal, health, etc.)
  • Filter by priority
  • See upcoming tasks (next 7 days, 30 days, etc.)
  • See overdue tasks
  • Search tasks

✨ ANALYTICS
  • Total tasks count
  • Tasks by status
  • High-priority tasks
  • Completion rate
  • Time tracking
  • Productivity trends

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS (After Setup)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ Setup complete
2. Test all features manually
3. Deploy frontend to Vercel
4. Deploy backend to Railway/Render
5. Set up CI/CD pipeline
6. Add more AI features (calendar integration, reminders)
7. Add real-time updates (WebSocket)
8. Add mobile app (React Native)

DEPLOYMENT:
  Frontend: npm run build → Upload dist/ to Vercel
  Backend: git push → Auto-deploy to Railway/Render
  Database: Already on Supabase (no deployment needed)

═══════════════════════════════════════════════════════════════════════════════

✅ YOU'RE READY TO GO!

Backend: http://localhost:5000
Frontend: http://localhost:3000

Start testing and building amazing features!

═══════════════════════════════════════════════════════════════════════════════
