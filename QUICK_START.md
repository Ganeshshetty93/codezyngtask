╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    TASKMASTER AI - QUICK START GUIDE                         ║
║                                                                               ║
║                   Get up and running in 5 minutes!                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚡ QUICK SETUP (5 MINUTES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  GET YOUR CREDENTIALS (2 minutes)

   Supabase Database URL:
   • Go to https://app.supabase.com → Select project
   • Settings → Database
   • Copy PostgreSQL URL: postgresql://postgres:PASSWORD@HOST:5432/postgres
   • Note: Replace PASSWORD with your DB password

   OpenAI API Key:
   • Go to https://platform.openai.com/api-keys
   • Click "Create new secret key"
   • Copy the key (starts with "sk-")

2️⃣  UPDATE .ENV FILE (1 minute)

   Edit: backend/.env

   SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@HOST:5432/postgres
   OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE

   Save!

3️⃣  START BACKEND (1 minute)

   PowerShell:
   cd c:\Projects\codezyng\backend
   npm run dev

   Expected: "✅ Database initialized successfully"

4️⃣  START FRONTEND (1 minute)

   New PowerShell:
   cd c:\Projects\codezyng\frontend
   npm run dev

   Expected: "Local: http://localhost:3000"

5️⃣  OPEN & TEST (1 minute)

   • Browser: http://localhost:3000
   • Register an account
   • Create a task
   • Test AI features

DONE! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTING CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTHENTICATION:
  ☐ Register new account
  ☐ Login with email/password
  ☐ Logout
  ☐ Token persists after refresh
  ☐ Unauthorized without token shows login

TASKS:
  ☐ Create task with title & description
  ☐ See task in list
  ☐ Click task to view details
  ☐ Edit task
  ☐ Change status (todo → in_progress → done)
  ☐ Set priority (low/medium/high)
  ☐ Set due date
  ☐ Delete task

AI FEATURES:
  ☐ Create task with AI suggestions:
    - Enter title and description
    - Check "Get AI Help"
    - Should suggest priority and time estimate
    - Create task

  ☐ Natural Language Task Creation:
    - Click "Quick Add"
    - Type: "Plan my product launch for next month"
    - Click "Create from Text"
    - Should create task + subtasks automatically

  ☐ Break Down Task:
    - Click task
    - Click "Break Down"
    - Should create subtasks automatically

FILTERING:
  ☐ Filter by Status: todo, in_progress, done
  ☐ Filter by Priority: low, medium, high
  ☐ Filter by Category: work, personal, health
  ☐ View "Upcoming" tasks (next 7 days)
  ☐ View "Overdue" tasks

STATS:
  ☐ See total tasks count
  ☐ See completion percentage
  ☐ See high-priority count
  ☐ See time tracking stats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🐛 COMMON ISSUES & FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: "ECONNREFUSED" or "Database connection failed"
Fix:
  1. Check .env SUPABASE_DB_URL has correct password
  2. Run: node backend/db/initialize.js (to test connection)
  3. If still fails: Reset DB password in Supabase Settings

Issue: "OpenAI error: Invalid API key"
Fix:
  1. Verify OPENAI_API_KEY in .env starts with "sk-"
  2. Check key is complete (should be long string)
  3. Try generating new key at https://platform.openai.com/api-keys
  4. Wait 1 minute after creating key before using

Issue: "Frontend won't load"
Fix:
  1. Check terminal shows: "Local: http://localhost:3000"
  2. Clear browser cache (Ctrl+Shift+Delete)
  3. If port 3000 busy: Kill process on port 3000
  4. Try: npm run dev again

Issue: "Backend starts but no DB initialization"
Fix:
  1. Check .env has SUPABASE_DB_URL (not empty)
  2. Run: node backend/db/initialize.js directly
  3. Check error message for connection details
  4. Verify Supabase project is active

Issue: "AI features not working"
Fix:
  1. Check OPENAI_API_KEY is set in .env
  2. Verify OpenAI account has credit available
  3. Check API call limit not exceeded
  4. Look at backend console for error details

Issue: "Registered but can't login"
Fix:
  1. Verify email used for registration
  2. Check password (case-sensitive)
  3. Try registering with different email
  4. Check backend console for validation errors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 USING POSTMAN TO TEST API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Download Postman: https://www.postman.com/downloads/

1. REGISTER USER:
   POST http://localhost:5000/api/users/register
   Body (JSON):
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123!"
   }

2. LOGIN:
   POST http://localhost:5000/api/users/login
   Body (JSON):
   {
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   
   Response: { "token": "eyJhbGciOiJIUzI1NiIs..." }
   Copy the token!

3. CREATE TASK (with token):
   POST http://localhost:5000/api/tasks
   Headers:
     Authorization: Bearer YOUR_TOKEN_HERE
   Body (JSON):
   {
     "title": "Build landing page",
     "description": "Create beautiful landing page",
     "priority": "high",
     "dueDate": "2024-02-28"
   }

4. GET ALL TASKS:
   GET http://localhost:5000/api/tasks
   Headers:
     Authorization: Bearer YOUR_TOKEN_HERE

5. NATURAL LANGUAGE TASK:
   POST http://localhost:5000/api/tasks/natural-language/create
   Headers:
     Authorization: Bearer YOUR_TOKEN_HERE
   Body (JSON):
   {
     "input": "Plan my product launch for next month"
   }

6. BREAK DOWN TASK:
   POST http://localhost:5000/api/tasks/TASK_ID/breakdown
   Headers:
     Authorization: Bearer YOUR_TOKEN_HERE

7. GET AI SUGGESTIONS:
   GET http://localhost:5000/api/tasks/ai/suggestions
   Headers:
     Authorization: Bearer YOUR_TOKEN_HERE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

codezyng/
├── frontend/
│   ├── src/
│   │   ├── main.jsx              Entry point
│   │   ├── App.jsx               Main component
│   │   ├── api.jsx               Axios instance
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx     Task list
│   │   │   ├── CreateTask.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── TaskCard.jsx
│   │   └── App.css
│   ├── vite.config.js            Vite config
│   ├── package.json
│   └── index.html                HTML entry
│
├── backend/
│   ├── db/
│   │   └── initialize.js         Create tables
│   ├── config/
│   │   └── database.js           PostgreSQL pool
│   ├── services/
│   │   ├── aiTaskService.js      AI features
│   │   └── authService.js        Auth logic
│   ├── models/
│   │   └── Task.js               Task DB ops
│   ├── controllers/
│   │   ├── taskController.js     Task handlers
│   │   └── userController.js     User handlers
│   ├── routes/
│   │   ├── taskRoutes.js         Task endpoints
│   │   └── userRoutes.js         Auth endpoints
│   ├── middleware/
│   │   └── auth.js               JWT verification
│   ├── server.js                 Express server
│   ├── package.json
│   └── .env                      Configuration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRONTEND DEPLOYMENT (Vercel):
  1. cd frontend
  2. npm run build
  3. Create account at vercel.com
  4. Upload dist/ folder
  5. Set environment variables (if needed)

BACKEND DEPLOYMENT (Railway or Render):
  1. Push code to GitHub
  2. Connect GitHub repo to Railway/Render
  3. Set environment variables:
     - SUPABASE_DB_URL
     - OPENAI_API_KEY
     - JWT_SECRET
  4. Deploy

DATABASE (Supabase):
  • Already deployed (nothing to do)
  • Just use connection string in production .env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For issues, check:
1. Backend console (terminal window running npm run dev)
2. Frontend console (F12 → Console tab)
3. Network tab (F12 → Network) for API calls
4. Supabase dashboard → Logs for DB errors
5. OpenAI dashboard → Usage for API limits

═══════════════════════════════════════════════════════════════════════════════

Ready? Start with: npm run dev in both terminal windows!

═══════════════════════════════════════════════════════════════════════════════
