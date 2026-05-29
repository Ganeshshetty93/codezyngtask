═══════════════════════════════════════════════════════════════════════════════
                  TASKMASTER AI - COMMAND REFERENCE
═══════════════════════════════════════════════════════════════════════════════

Copy & paste these commands in PowerShell to get started!

═══════════════════════════════════════════════════════════════════════════════
🚀 QUICK LAUNCH (Copy & Run These)
═══════════════════════════════════════════════════════════════════════════════

# TERMINAL 1 - START BACKEND
cd c:\Projects\codezyng\backend; npm run dev

# TERMINAL 2 - START FRONTEND
cd c:\Projects\codezyng\frontend; npm run dev

# Then open:
# Browser: http://localhost:3000

═══════════════════════════════════════════════════════════════════════════════
📝 BEFORE RUNNING - EDIT .ENV FILE
═══════════════════════════════════════════════════════════════════════════════

File: c:\Projects\codezyng\backend\.env

These two lines MUST be updated with YOUR credentials:

SUPABASE_DB_URL="postgresql://postgres:YOUR_PASSWORD@pfqrvqayboguojwtyukf.supabase.co:5432/postgres"
OPENAI_API_KEY="sk-proj-YOUR_ACTUAL_KEY_HERE"

Example:
SUPABASE_DB_URL="postgresql://postgres:MySecurePassword123@pfqrvqayboguojwtyukf.supabase.co:5432/postgres"
OPENAI_API_KEY="sk-proj-aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890"

═══════════════════════════════════════════════════════════════════════════════
🔧 SETUP COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Install backend dependencies
cd c:\Projects\codezyng\backend; npm install

# Install frontend dependencies
cd c:\Projects\codezyng\frontend; npm install

# Initialize database tables
cd c:\Projects\codezyng\backend; node db/initialize.js

# Test database connection
cd c:\Projects\codezyng\backend; node -e "require('dotenv').config(); require('pg').query('SELECT 1')"

═══════════════════════════════════════════════════════════════════════════════
▶️ RUNNING COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Start backend (development with auto-reload)
cd c:\Projects\codezyng\backend; npm run dev

# Start backend (production)
cd c:\Projects\codezyng\backend; npm start

# Start frontend (development)
cd c:\Projects\codezyng\frontend; npm run dev

# Build frontend for production
cd c:\Projects\codezyng\frontend; npm run build

# Preview production build
cd c:\Projects\codezyng\frontend; npm run preview

═══════════════════════════════════════════════════════════════════════════════
🧪 TESTING COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Test health endpoint
curl http://localhost:5000/api/health

# Test register (PowerShell)
$body = @{name='Test User'; email='test@example.com'; password='TestPass123!'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/users/register' -Method POST -Body $body -ContentType 'application/json'

# Test login (PowerShell)
$body = @{email='test@example.com'; password='TestPass123!'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:5000/api/users/login' -Method POST -Body $body -ContentType 'application/json'

═══════════════════════════════════════════════════════════════════════════════
🔍 DEBUGGING COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process on port 5000 (replace PID with actual number)
taskkill /PID <PID> /F

# Check if port 3000 is in use
netstat -ano | findstr :3000

# View environment variables
Get-ChildItem Env: | Where-Object {$_.Name -like "SUPABASE*" -or $_.Name -like "OPENAI*"}

# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall node_modules (if having issues)
cd c:\Projects\codezyng\backend; Remove-Item node_modules -Recurse; npm install

═══════════════════════════════════════════════════════════════════════════════
📁 DIRECTORY COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Navigate to project root
cd c:\Projects\codezyng

# Navigate to backend
cd c:\Projects\codezyng\backend

# Navigate to frontend
cd c:\Projects\codezyng\frontend

# List backend files
Get-ChildItem -Path c:\Projects\codezyng\backend -Recurse

# List frontend files
Get-ChildItem -Path c:\Projects\codezyng\frontend -Recurse

═══════════════════════════════════════════════════════════════════════════════
📊 MONITORING COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Watch backend logs (in separate terminal)
Get-Content c:\Projects\codezyng\backend\*.log -Wait

# Monitor file changes in backend
Get-ChildItem c:\Projects\codezyng\backend -Recurse -Include "*.js" | ForEach-Object { Write-Host $_.FullName; Get-Date }

# Check backend folder size
(Get-ChildItem c:\Projects\codezyng\backend -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Check frontend folder size
(Get-ChildItem c:\Projects\codezyng\frontend -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

═══════════════════════════════════════════════════════════════════════════════
🗑️ CLEANUP COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Remove backend node_modules (to save space)
cd c:\Projects\codezyng\backend; Remove-Item node_modules -Recurse -Force

# Remove frontend node_modules (to save space)
cd c:\Projects\codezyng\frontend; Remove-Item node_modules -Recurse -Force

# Remove all node_modules
cd c:\Projects\codezyng; Get-ChildItem -Include node_modules -Recurse | Remove-Item -Recurse -Force

# Clear npm cache
npm cache clean --force

# Remove backend build files
cd c:\Projects\codezyng\backend; Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue

# Remove frontend build files
cd c:\Projects\codezyng\frontend; Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue

═══════════════════════════════════════════════════════════════════════════════
🌐 BROWSER COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Open application in default browser
start http://localhost:3000

# Open backend health check
start http://localhost:5000/api/health

# Open Supabase dashboard
start https://app.supabase.com

# Open OpenAI dashboard
start https://platform.openai.com/api-keys

═══════════════════════════════════════════════════════════════════════════════
💾 GIT COMMANDS (If Using Git)
═══════════════════════════════════════════════════════════════════════════════

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update TaskMaster AI configuration"

# View logs
git log --oneline

# See changes made
git diff

═══════════════════════════════════════════════════════════════════════════════
⚙️ ENVIRONMENT VARIABLES QUICK REFERENCE
═══════════════════════════════════════════════════════════════════════════════

Variable: PORT
Value: 5000
Description: Backend server port

Variable: JWT_SECRET
Value: your_jwt_secret_key_here
Description: Secret key for JWT token signing (change before production!)

Variable: NODE_ENV
Value: development (or production)
Description: Environment mode

Variable: SUPABASE_URL
Value: https://pfqrvqayboguojwtyukf.supabase.co
Description: Supabase project URL

Variable: SUPABASE_KEY
Value: sb_publishable_9gx92HGMcxWZw35SXaTEJg_qcajae7f
Description: Supabase publishable key

Variable: SUPABASE_DB_URL
Value: postgresql://postgres:PASSWORD@host:5432/postgres
Description: PostgreSQL connection string (UPDATE THIS!)

Variable: OPENAI_API_KEY
Value: sk-proj-...
Description: OpenAI API key (UPDATE THIS!)

═══════════════════════════════════════════════════════════════════════════════
📋 TROUBLESHOOTING COMMANDS
═══════════════════════════════════════════════════════════════════════════════

# Test PostgreSQL connection directly
psql "postgresql://postgres:PASSWORD@pfqrvqayboguojwtyukf.supabase.co:5432/postgres"

# Test OpenAI API connection
curl -H "Authorization: Bearer sk-your-key" https://api.openai.com/v1/models

# View backend logs
Get-Content c:\Projects\codezyng\backend\server.js

# Find all .env files
Get-ChildItem c:\Projects\codezyng -Include .env -Recurse

# Check for open ports
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -eq 5000 -or $_.LocalPort -eq 3000}

═══════════════════════════════════════════════════════════════════════════════
📞 QUICK HELP
═══════════════════════════════════════════════════════════════════════════════

Need to know which process is using a port?
  netstat -ano | findstr :PORT_NUMBER

Need to stop all Node processes?
  Get-Process node | Stop-Process -Force

Need to see running processes?
  Get-Process node

Need to check Node.js is installed?
  node --version

Need to reinstall everything?
  cd c:\Projects\codezyng
  Remove-Item backend/node_modules -Recurse -Force
  Remove-Item frontend/node_modules -Recurse -Force
  cd backend; npm install; cd ..\frontend; npm install; cd ..

═══════════════════════════════════════════════════════════════════════════════
🎯 TYPICAL WORKFLOW
═══════════════════════════════════════════════════════════════════════════════

1. Edit .env file with your credentials
   → SUPABASE_DB_URL
   → OPENAI_API_KEY

2. Open Terminal 1:
   cd c:\Projects\codezyng\backend
   npm run dev

3. Open Terminal 2:
   cd c:\Projects\codezyng\frontend
   npm run dev

4. Open Browser:
   http://localhost:3000

5. Test the application:
   → Register
   → Login
   → Create tasks
   → Use AI features

═══════════════════════════════════════════════════════════════════════════════
✨ YOU'RE READY!

Just run those first two commands and you're good to go!

═══════════════════════════════════════════════════════════════════════════════
