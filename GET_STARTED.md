#!/usr/bin/env bash
# TaskMaster AI - Complete Getting Started Guide
# Generated: May 28, 2026

═══════════════════════════════════════════════════════════════════════════════
                        TASKMASTER AI - GET STARTED
═══════════════════════════════════════════════════════════════════════════════

🎯 OBJECTIVE: Get TaskMaster AI running in 10 minutes
   • Create PostgreSQL tables
   • Start backend server
   • Start frontend
   • Test application

═══════════════════════════════════════════════════════════════════════════════

⚡ QUICK SETUP (10 Minutes)
═══════════════════════════════════════════════════════════════════════════════

STEP 1: Prepare Your Credentials (2 minutes)
────────────────────────────────────────────────────────────────────────────────

📌 You need TWO things:

A) SUPABASE DATABASE CONNECTION STRING
   Where to get it:
   1. Go to https://app.supabase.com
   2. Click on your project (pfqrvqayboguojwtyukf)
   3. Go to Settings → Database
   4. Find "Connection Pooling" section
   5. Copy the PostgreSQL connection string
   
   It looks like:
   postgresql://postgres:YOUR_PASSWORD@pfqrvqayboguojwtyukf.supabase.co:5432/postgres
   
   ⚠️ Replace YOUR_PASSWORD with your actual database password
   
   If you forgot your password:
   • Click Settings → Database
   • Find user "postgres"
   • Click the three dots → Reset password
   • Check your email for temporary password

B) OPENAI API KEY
   Where to get it:
   1. Go to https://platform.openai.com/api-keys
   2. Click "Create new secret key"
   3. Copy it immediately (you won't see it again!)
   
   It looks like:
   sk-proj-aBcDeFgHiJkLmNoPqRsTuVwXyZ...
   
   💡 Free Trial Available: $5 credit for first 3 months

═══════════════════════════════════════════════════════════════════════════════

STEP 2: Configure Backend Environment (2 minutes)
────────────────────────────────────────────────────────────────────────────────

File to edit: c:\Projects\codezyng\backend\.env

Open it and update these two lines:

BEFORE:
  SUPABASE_DB_URL="postgresql://postgres:[YOUR_PASSWORD]@pfqrvqayboguojwtyukf.supabase.co:5432/postgres"
  OPENAI_API_KEY="your_openai_api_key_here"

AFTER (with your actual credentials):
  SUPABASE_DB_URL="postgresql://postgres:MyActualPassword@pfqrvqayboguojwtyukf.supabase.co:5432/postgres"
  OPENAI_API_KEY="sk-proj-aBcDeFgHiJkLmNoPqRsTuVwXyZ..."

Save the file!

═══════════════════════════════════════════════════════════════════════════════

STEP 3: Start Backend Server (3 minutes)
────────────────────────────────────────────────────────────────────────────────

Open PowerShell and run:

  cd c:\Projects\codezyng\backend
  npm run dev

Expected output:
  ✅ Database initialized successfully
  
  ╔════════════════════════════════╗
  ║  TaskMaster AI Server Running  ║
  ║  Port: 5000                     ║
  ║  Environment: development       ║
  ╚════════════════════════════════╝

✅ If you see this, backend is working!

If you get an error:
  • ERROR: "ECONNREFUSED" → Check SUPABASE_DB_URL in .env
  • ERROR: "password authentication failed" → Check password is correct
  • ERROR: "Port 5000 already in use" → Kill the process on port 5000

═══════════════════════════════════════════════════════════════════════════════

STEP 4: Start Frontend Server (2 minutes)
────────────────────────────────────────────────────────────────────────────────

Open NEW PowerShell window and run:

  cd c:\Projects\codezyng\frontend
  npm run dev

Expected output:
  ✓ built in Xs
  
  Local:        http://localhost:3000/

✅ If you see this, frontend is working!

═══════════════════════════════════════════════════════════════════════════════

STEP 5: Open the Application (1 minute)
────────────────────────────────────────────────────────────────────────────────

Open your browser:
  http://localhost:3000

You should see the Login page!

═══════════════════════════════════════════════════════════════════════════════

🧪 QUICK TEST (3 minutes)
═══════════════════════════════════════════════════════════════════════════════

1. REGISTER AN ACCOUNT
   • Click "Sign Up" or "Register"
   • Fill in: Name, Email, Password
   • Click "Create Account"
   • Should redirect to Dashboard

2. CREATE A TASK
   • Click "Add Task" or "New Task"
   • Enter Title: "Learn TaskMaster AI"
   • Enter Description: "Explore all AI features"
   • Click "Create Task"
   • Task should appear in your list

3. TEST AI FEATURES
   • Click "Quick Add" or "AI Create"
   • Type: "Plan my product launch for next month"
   • Click "Create from Text"
   • Magic happens! ✨ Task created with subtasks

4. TEST FILTERING
   • Click filter by Status
   • Select "Todo"
   • Should show only todo tasks
   • Try other filters too

═══════════════════════════════════════════════════════════════════════════════

✅ VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Backend Status:
  ☐ Server running on port 5000
  ☐ Database tables created
  ☐ No connection errors in console
  ☐ Health endpoint working: http://localhost:5000/api/health

Frontend Status:
  ☐ App running on port 3000
  ☐ Login page loads
  ☐ No errors in browser console (F12)
  ☐ Can register new account
  ☐ Can login successfully

Database Status:
  ☐ Tables created in Supabase (check Table Editor)
  ☐ Can create tasks
  ☐ Tasks appear in database
  ☐ No database errors in backend console

AI Features Status:
  ☐ Can use natural language to create tasks
  ☐ AI suggests priority and time
  ☐ Can break down tasks into subtasks
  ☐ Can see AI suggestions

═══════════════════════════════════════════════════════════════════════════════

🔧 TROUBLESHOOTING QUICK FIXES
═══════════════════════════════════════════════════════════════════════════════

Problem: "Database connection failed"
Fixes:
  1. Check SUPABASE_DB_URL in .env has correct password
  2. Verify host is: pfqrvqayboguojwtyukf.supabase.co
  3. Try: psql postgresql://postgres:PASSWORD@pfqrvqayboguojwtyukf.supabase.co:5432/postgres
  4. If still fails: Reset password in Supabase Settings

Problem: "OpenAI API error"
Fixes:
  1. Verify OPENAI_API_KEY starts with "sk-"
  2. Check it's the full key (should be long)
  3. Verify OpenAI account has credit (dashboard.openai.com)
  4. Try generating a new key

Problem: "Port 5000 already in use"
Fixes:
  # Find process on port 5000
  netstat -ano | findstr :5000
  
  # Kill it (replace PID with the number you found)
  taskkill /PID <PID> /F

Problem: "Frontend can't connect to backend"
Fixes:
  1. Verify backend is running (check console)
  2. Check browser console (F12) for specific errors
  3. Try: curl http://localhost:5000/api/health
  4. Make sure both ports 3000 and 5000 are accessible

Problem: "Dependencies not installed"
Fixes:
  cd c:\Projects\codezyng\backend
  npm install
  
  cd c:\Projects\codezyng\frontend
  npm install

═══════════════════════════════════════════════════════════════════════════════

📱 TESTING WITH POSTMAN (Optional)
═══════════════════════════════════════════════════════════════════════════════

If you have Postman installed:

1. REGISTER USER
   POST http://localhost:5000/api/users/register
   Body (JSON):
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "TestPass123!"
   }

2. LOGIN
   POST http://localhost:5000/api/users/login
   Body (JSON):
   {
     "email": "test@example.com",
     "password": "TestPass123!"
   }
   
   Save the token from response!

3. CREATE TASK
   POST http://localhost:5000/api/tasks
   Headers:
     Authorization: Bearer [YOUR_TOKEN]
   Body (JSON):
   {
     "title": "Test Task",
     "description": "Testing from Postman",
     "priority": "high"
   }

4. GET ALL TASKS
   GET http://localhost:5000/api/tasks
   Headers:
     Authorization: Bearer [YOUR_TOKEN]

═══════════════════════════════════════════════════════════════════════════════

🎓 WHAT YOU CAN DO NOW
═══════════════════════════════════════════════════════════════════════════════

✨ CORE FEATURES
  ✅ Register and login
  ✅ Create, edit, delete tasks
  ✅ Set priorities (low, medium, high)
  ✅ Set due dates
  ✅ Mark status (todo → in progress → done)
  ✅ Organize by category

✨ AI FEATURES
  ✅ Create tasks using natural language
     "Plan my product launch" → Creates task + subtasks automatically
  
  ✅ Break down epic tasks
     Click task → Click "Break Down" → AI creates subtasks
  
  ✅ Get priority suggestions
     Describe task → AI suggests priority
  
  ✅ Get time estimates
     Describe task → AI estimates hours needed
  
  ✅ Get smart suggestions
     Dashboard shows AI-recommended tasks based on your history

✨ ORGANIZATION
  ✅ Filter by status (todo, in progress, done)
  ✅ Filter by priority (low, medium, high)
  ✅ Filter by category (work, personal, etc.)
  ✅ View upcoming tasks (7 days, 30 days)
  ✅ View overdue tasks
  ✅ See statistics and insights

═══════════════════════════════════════════════════════════════════════════════

📚 NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

1. ✅ Got everything running? (you are here)
2. Read: QUICK_START.md for more details
3. Read: TASKMASTER_AI_SETUP.md for complete guide
4. Test: All features in the app
5. Deploy: When ready (see deployment section below)
6. Enhance: Add more features, customize UI

═══════════════════════════════════════════════════════════════════════════════

🚀 DEPLOYMENT (When You're Ready)
═══════════════════════════════════════════════════════════════════════════════

FRONTEND to Vercel:
  1. cd frontend
  2. npm run build
  3. Install Vercel CLI: npm i -g vercel
  4. Run: vercel
  5. Follow prompts

BACKEND to Railway/Render:
  1. Push code to GitHub
  2. Connect repo to Railway or Render
  3. Set environment variables:
     SUPABASE_DB_URL
     OPENAI_API_KEY
     JWT_SECRET
  4. Deploy!

DATABASE (Supabase):
  • Already on Supabase (nothing to deploy)
  • Just use connection string from .env

═══════════════════════════════════════════════════════════════════════════════

💡 TIPS & BEST PRACTICES
═══════════════════════════════════════════════════════════════════════════════

• Keep your API keys secret - never commit .env to git
• Use .env.example for sharing configuration template
• Monitor OpenAI usage to avoid surprise bills
• Backup your Supabase database regularly
• Test features before deploying to production
• Check browser console (F12) if things don't work
• Check backend console for server errors
• Use Postman to debug API issues

═══════════════════════════════════════════════════════════════════════════════

🎉 YOU'RE READY!

Start both servers, open http://localhost:3000, and start managing tasks
with AI assistance!

Need help? Check the documentation files:
  • QUICK_START.md - 5-minute setup
  • TASKMASTER_AI_SETUP.md - Complete guide
  • PROJECT_STATUS_AND_NEXT_STEPS.md - Full status

═══════════════════════════════════════════════════════════════════════════════
