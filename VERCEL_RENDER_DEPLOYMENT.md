# 🚀 INTERVUEX DEPLOYMENT: Vercel + Render

## Complete Step-by-Step Guide

**Frontend**: Vercel (Free)  
**Backend + Database**: Render ($7/month)  
**Total Time**: 20-30 minutes

---

## 📋 PART 1: PREPARE YOUR CODE

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/intervuex.git
git branch -M main
git push -u origin main
```

### Step 2: Create Production Environment Files

Create `server/.env.production` (don't commit this):
```env
NODE_ENV=production
PORT=5000

# Database (will be filled from Render)
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM="INTERVUEX <your-email@gmail.com>"

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Session
SESSION_DURATION=1800
LINK_EXPIRY_HOURS=24
```

---

## 🗄️ PART 2: DEPLOY DATABASE (Render)

### Step 1: Create Render Account

1. Go to **[render.com](https://render.com)**
2. Click **"Get Started"**
3. Sign up with **GitHub**
4. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure database:
   ```
   Name: intervuex-db
   Database: intervuex
   User: intervuex_user
   Region: Oregon (US West) or closest to you
   Plan: Free (or Starter $7/month for better performance)
   ```
3. Click **"Create Database"**
4. Wait 2-3 minutes for provisioning

### Step 3: Get Database Connection Details

1. Click on your database **"intervuex-db"**
2. Scroll to **"Connections"** section
3. Copy these values (you'll need them):
   ```
   Internal Database URL: postgres://intervuex_user:xxx@xxx.oregon-postgres.render.com/intervuex
   
   Host: xxx.oregon-postgres.render.com
   Port: 5432
   Database: intervuex
   Username: intervuex_user
   Password: [long generated password]
   ```

### Step 4: Run Database Migrations

**Option A: Using Render Shell (Recommended)**

1. Go to your database dashboard
2. Click **"Connect"** → **"External Connection"**
3. Copy the `psql` command
4. Open your local terminal and run:
   ```bash
   # Connect to database
   psql postgres://intervuex_user:password@host.render.com/intervuex
   
   # Run migrations
   \i server/migrations/001_initial_schema.sql
   \i server/migrations/002_add_time_window.sql
   
   # Verify tables created
   \dt
   
   # Exit
   \q
   ```

**Option B: Using pgAdmin or DBeaver**

1. Download [pgAdmin](https://www.pgadmin.org/) or [DBeaver](https://dbeaver.io/)
2. Create new connection with Render database details
3. Open SQL editor
4. Copy and paste contents of `001_initial_schema.sql`
5. Execute
6. Copy and paste contents of `002_add_time_window.sql`
7. Execute

---

## 🖥️ PART 3: DEPLOY BACKEND (Render)

### Step 1: Create Web Service

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"**
4. Select your **intervuex** repository
5. Click **"Connect"**

### Step 2: Configure Web Service

Fill in the following:

**Basic Settings:**
```
Name: intervuex-backend
Region: Oregon (US West) - same as database
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Plan:**
```
Instance Type: Free (or Starter $7/month for better performance)
```

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```env
NODE_ENV=production
PORT=5000

# Database (from Part 2, Step 3)
DB_HOST=xxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=intervuex
DB_USER=intervuex_user
DB_PASSWORD=[your database password]

# JWT Secret (generate random string)
JWT_SECRET=intervuex-production-secret-2026-change-this-to-random-string

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=INTERVUEX <your-email@gmail.com>

# Frontend URL (temporary, will update after Vercel)
FRONTEND_URL=https://localhost:5173

# CORS (temporary, will update after Vercel)
ALLOWED_ORIGINS=https://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Session
SESSION_DURATION=1800
LINK_EXPIRY_HOURS=24
```

### Step 4: Create Web Service

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Watch the logs for any errors
4. Once deployed, you'll see: **"Your service is live 🎉"**

### Step 5: Get Backend URL

1. At the top of the page, you'll see your service URL:
   ```
   https://intervuex-backend.onrender.com
   ```
2. **Copy this URL** - you'll need it for Vercel

### Step 6: Test Backend

Open in browser:
```
https://intervuex-backend.onrender.com/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-02-10T..."}
```

---

## 🌐 PART 4: DEPLOY FRONTEND (Vercel)

### Step 1: Create Vercel Account

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"**
3. Sign up with **GitHub**
4. Authorize Vercel

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your **intervuex** repository
3. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:**
```
Framework: Vite
```

**Root Directory:**
```
./  (leave as root)
```

**Build Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Add Environment Variable

Click **"Environment Variables"**

Add:
```
Name: VITE_API_URL
Value: https://intervuex-backend.onrender.com/api
```

**Important**: Replace with YOUR actual Render backend URL!

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Once deployed, you'll see: **"Congratulations! 🎉"**

### Step 6: Get Frontend URL

Your app will be live at:
```
https://intervuex-[random].vercel.app
```

Or if you added a custom domain:
```
https://your-domain.com
```

**Copy this URL** - you need to update the backend!

---

## 🔄 PART 5: UPDATE BACKEND WITH FRONTEND URL

### Step 1: Update Render Environment Variables

1. Go back to **Render Dashboard**
2. Click on **"intervuex-backend"**
3. Click **"Environment"** in left sidebar
4. Update these variables:

```env
FRONTEND_URL=https://intervuex-[random].vercel.app
ALLOWED_ORIGINS=https://intervuex-[random].vercel.app
```

**Replace with YOUR actual Vercel URL!**

### Step 2: Redeploy Backend

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait 2-3 minutes
3. Backend will restart with new settings

---

## ✅ PART 6: VERIFY DEPLOYMENT

### Test Checklist:

1. **Frontend loads**: Visit your Vercel URL
   ```
   https://intervuex-[random].vercel.app
   ```

2. **Backend responds**: Visit backend health check
   ```
   https://intervuex-backend.onrender.com/api/health
   ```

3. **Register recruiter**:
   - Go to `/recruiter/register`
   - Create account
   - Should redirect to dashboard

4. **Add candidate**:
   - Click "Add Candidate"
   - Fill form
   - Upload resume (PDF)
   - Submit

5. **Schedule interview**:
   - Click "Schedule Interview"
   - Choose time window or 24-hour
   - Copy interview link

6. **Test interview**:
   - Open interview link in incognito
   - Accept terms
   - Start interview
   - Test face detection
   - Test speech-to-text
   - Submit answer

7. **Check email**:
   - Verify candidate received email
   - Check spam folder if not in inbox

---

## 🎨 PART 7: CUSTOM DOMAIN (Optional)

### For Vercel (Frontend):

1. Go to your project settings
2. Click **"Domains"**
3. Add your domain: `intervuex.com`
4. Follow DNS instructions
5. Wait for SSL certificate (automatic)

### For Render (Backend):

1. Go to your service settings
2. Click **"Custom Domains"**
3. Add: `api.intervuex.com`
4. Update DNS with CNAME record
5. Wait for SSL certificate

### Update Environment Variables:

**Render (Backend)**:
```env
FRONTEND_URL=https://intervuex.com
ALLOWED_ORIGINS=https://intervuex.com
```

**Vercel (Frontend)**:
```env
VITE_API_URL=https://api.intervuex.com/api
```

---

## 🔧 TROUBLESHOOTING

### Frontend shows "Network Error":
- Check VITE_API_URL is correct
- Verify backend is running
- Check browser console for CORS errors

### Backend won't start:
- Check environment variables are set
- Verify database connection details
- Check Render logs for errors

### Database connection fails:
- Verify DB_HOST, DB_PASSWORD are correct
- Check database is running on Render
- Try connecting with psql locally

### Emails not sending:
- Verify EMAIL_PASSWORD (no spaces!)
- Check Gmail App Password is correct
- Test with console logs first

### Face detection not working:
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Verify Face-API.js models loading

---

## 💰 COST BREAKDOWN

### Free Tier:
- Vercel: **Free** (100GB bandwidth)
- Render Database: **Free** (1GB storage, expires after 90 days)
- Render Backend: **Free** (750 hours/month, sleeps after 15min)
- **Total: FREE** (with limitations)

### Paid Tier (Recommended):
- Vercel: **Free** (sufficient for most use cases)
- Render Database: **$7/month** (256MB RAM, no sleep)
- Render Backend: **$7/month** (512MB RAM, no sleep)
- **Total: $14/month**

---

## 📊 MONITORING

### Vercel Analytics:
- Go to project → Analytics
- View page views, performance, errors

### Render Logs:
- Go to service → Logs
- View real-time application logs
- Check for errors

### Database Metrics:
- Go to database → Metrics
- View connections, queries, storage

---

## 🔄 UPDATES & REDEPLOYMENT

### To update your app:

1. **Make changes locally**
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

3. **Automatic deployment**:
   - Vercel: Auto-deploys on push
   - Render: Auto-deploys on push

4. **Manual deployment** (if needed):
   - Vercel: Dashboard → Deployments → Redeploy
   - Render: Dashboard → Manual Deploy

---

## 🎉 YOU'RE LIVE!

Your INTERVUEX platform is now deployed and accessible worldwide!

**Frontend**: https://intervuex-[random].vercel.app  
**Backend**: https://intervuex-backend.onrender.com

Share the link with recruiters and start conducting AI-powered interviews! 🚀

---

## 📞 NEED HELP?

- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Verify all environment variables are set
- Test locally first before deploying

**GOOD LUCK WITH YOUR DEPLOYMENT!** 🎊
