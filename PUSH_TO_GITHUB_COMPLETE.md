# 🚀 COMPLETE GUIDE: PUSH INTERVUEX TO GITHUB

## ⚠️ IMPORTANT: Remove Sensitive Data First!

Before pushing to GitHub, we need to remove API keys from tracked files.

### Step 1: Clean Environment Files

Open these files and replace with placeholders:

**File: `.env`**
```env
# BEFORE PUSHING TO GITHUB, REPLACE THESE:
OPENAI_API_KEY=your-openai-api-key-here
EMAIL_PASSWORD=your-gmail-app-password-here
```

**File: `server/.env`**
```env
# BEFORE PUSHING TO GITHUB, REPLACE THESE:
OPENAI_API_KEY=your-openai-api-key-here
EMAIL_PASSWORD=your-gmail-app-password-here
```

---

## 📥 STEP 1: INSTALL GIT

### Download Git:
1. Go to: https://git-scm.com/download/win
2. Download "64-bit Git for Windows Setup"
3. Run installer
4. Click "Next" through all options (defaults are fine)
5. Click "Install"
6. Click "Finish"

### Verify Installation:
Open **Command Prompt** (cmd) and type:
```bash
git --version
```

Should show: `git version 2.x.x`

---

## 🔧 STEP 2: CONFIGURE GIT

Open **Command Prompt** and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email.

---

## 📁 STEP 3: INITIALIZE GIT REPOSITORY

In Command Prompt, navigate to your project:

```bash
cd C:\Users\Aksha\Desktop\miniproject
```

Initialize Git:

```bash
git init
```

You should see: `Initialized empty Git repository`

---

## 📝 STEP 4: ADD FILES TO GIT

Add all files:

```bash
git add .
```

Check what will be committed:

```bash
git status
```

You should see a list of files in green.

---

## 💾 STEP 5: COMMIT FILES

Create your first commit:

```bash
git commit -m "Initial commit: INTERVUEX AI-Powered Interview Platform"
```

You should see: `X files changed, Y insertions(+)`

---

## 🌐 STEP 6: CREATE GITHUB REPOSITORY

### Option A: Using GitHub Website

1. **Go to**: https://github.com
2. **Sign in** (or create account if you don't have one)
3. **Click** the "+" icon (top right) → "New repository"
4. **Fill in**:
   ```
   Repository name: intervuex
   Description: AI-Powered Virtual Interview Platform with Real-time Proctoring
   Public or Private: Your choice
   
   ❌ DON'T check "Initialize with README"
   ❌ DON'T add .gitignore
   ❌ DON'T add license
   ```
5. **Click** "Create repository"

### You'll see a page with commands - IGNORE THEM, follow below instead!

---

## 🔗 STEP 7: CONNECT TO GITHUB

Copy your repository URL from GitHub. It looks like:
```
https://github.com/YOUR_USERNAME/intervuex.git
```

In Command Prompt, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/intervuex.git
```

**Replace YOUR_USERNAME with your actual GitHub username!**

Verify it's added:

```bash
git remote -v
```

Should show:
```
origin  https://github.com/YOUR_USERNAME/intervuex.git (fetch)
origin  https://github.com/YOUR_USERNAME/intervuex.git (push)
```

---

## 🚀 STEP 8: PUSH TO GITHUB

Rename branch to main:

```bash
git branch -M main
```

Push to GitHub:

```bash
git push -u origin main
```

### If asked for credentials:

**Username**: Your GitHub username  
**Password**: Use **Personal Access Token** (not your password!)

#### How to create Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "INTERVUEX Deployment"
4. Expiration: 90 days (or No expiration)
5. Check: ✅ repo (all sub-options)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)
8. Use this token as password when pushing

---

## ✅ STEP 9: VERIFY ON GITHUB

1. Go to: https://github.com/YOUR_USERNAME/intervuex
2. You should see all your files!
3. Check that `.env` files show placeholders (not real API keys)

---

## 🔄 FUTURE UPDATES

When you make changes:

```bash
# Add changed files
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

---

## 🎯 NEXT STEPS: DEPLOY

Now that your code is on GitHub, you can deploy:

1. **Vercel** (Frontend):
   - Go to vercel.com
   - Import from GitHub
   - Select "intervuex" repository

2. **Render** (Backend + Database):
   - Go to render.com
   - Create PostgreSQL database
   - Create Web Service from GitHub
   - Select "intervuex" repository

Follow the detailed steps in `VERCEL_RENDER_DEPLOYMENT.md`

---

## 🆘 TROUBLESHOOTING

### "git: command not found"
- Git not installed or not in PATH
- Restart Command Prompt after installing Git
- Try Git Bash instead of Command Prompt

### "Permission denied"
- Use Personal Access Token instead of password
- Make sure token has "repo" permissions

### "Repository not found"
- Check repository URL is correct
- Make sure repository exists on GitHub
- Verify you're logged into correct GitHub account

### "Failed to push"
- Check internet connection
- Verify remote URL: `git remote -v`
- Try: `git push -f origin main` (force push)

---

## 📋 QUICK REFERENCE

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main

# View remotes
git remote -v

# View commit history
git log --oneline
```

---

## 🎉 CONGRATULATIONS!

Your INTERVUEX platform is now on GitHub and ready to deploy!

**Next**: Follow `VERCEL_RENDER_DEPLOYMENT.md` to deploy your app! 🚀
