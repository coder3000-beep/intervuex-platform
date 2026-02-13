# 🚀 INTERVUEX DEPLOYMENT GUIDE

## Complete Guide to Host Your Interview Platform

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ PostgreSQL database (local or cloud)
- ✅ OpenAI API key
- ✅ Gmail account with App Password (for emails)
- ✅ Domain name (optional but recommended)

---

## 🎯 OPTION 1: Deploy to Vercel + Railway (RECOMMENDED)

### Best for: Quick deployment, automatic scaling, free tier available

### Step 1: Deploy Database (Railway)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up** with GitHub
3. **Create New Project** → **Provision PostgreSQL**
4. **Copy connection details**:
   ```
   Host: containers-us-west-xxx.railway.app
   Port: 5432
   Database: railway
   Username: postgres
   Password: [generated password]
   ```

5. **Connect and run migrations**:
   ```bash
   # Install PostgreSQL client
   npm install -g pg
   
   # Connect to Railway database
   psql -h [host] -U postgres -d railway
   
   # Run migrations
   \i server/migrations/001_initial_schema.sql
   \i server/migrations/002_add_time_window.sql
   ```

### Step 2: Deploy Backend (Railway)

1. **In Railway, click "New" → "GitHub Repo"**
2. **Select your repository**
3. **Add environment variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   
   # Database (from Railway PostgreSQL)
   DB_HOST=[railway host]
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=[railway password]
   
   # JWT
   JWT_SECRET=[generate random string]
   
   # OpenAI
   OPENAI_API_KEY=sk-proj-...
   
   # Email
   EMAIL_SERVICE=gmail
   EMAIL_USER=intervuex@gmail.com
   EMAIL_PASSWORD=bdglokuugbwlkttt
   EMAIL_FROM="INTERVUEX <intervuex@gmail.com>"
   
   # Frontend URL (will update after Vercel deployment)
   FRONTEND_URL=https://your-app.vercel.app
   
   # CORS
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

4. **Set root directory**: `server`
5. **Deploy** - Railway will auto-deploy
6. **Copy backend URL**: `https://your-app.up.railway.app`

### Step 3: Deploy Frontend (Vercel)

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up** with GitHub
3. **Import your repository**
4. **Configure build settings**:
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add environment variable**:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```

6. **Deploy** - Vercel will build and deploy
7. **Copy frontend URL**: `https://your-app.vercel.app`

### Step 4: Update Backend with Frontend URL

1. **Go back to Railway**
2. **Update environment variables**:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. **Redeploy backend**

### ✅ Done! Your app is live!

---

## 🎯 OPTION 2: Deploy to Render (All-in-One)

### Best for: Simple setup, everything in one place

### Step 1: Create Render Account

1. **Go to [Render.com](https://render.com)**
2. **Sign up** with GitHub

### Step 2: Deploy Database

1. **Dashboard → New → PostgreSQL**
2. **Name**: `intervuex-db`
3. **Plan**: Free
4. **Create Database**
5. **Copy Internal Database URL**

### Step 3: Deploy Backend

1. **Dashboard → New → Web Service**
2. **Connect your repository**
3. **Configure**:
   - Name: `intervuex-backend`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add environment variables** (same as Railway above)
5. **Create Web Service**
6. **Copy backend URL**: `https://intervuex-backend.onrender.com`

### Step 4: Deploy Frontend

1. **Dashboard → New → Static Site**
2. **Connect your repository**
3. **Configure**:
   - Name: `intervuex-frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

4. **Add environment variable**:
   ```env
   VITE_API_URL=https://intervuex-backend.onrender.com/api
   ```

5. **Create Static Site**

### Step 5: Run Database Migrations

1. **Go to backend service**
2. **Shell tab**
3. **Run**:
   ```bash
   cd server
   node migrations/run.js
   ```

---

## 🎯 OPTION 3: Deploy to Heroku

### Best for: Traditional deployment, good documentation

### Step 1: Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

### Step 2: Create Heroku Apps

```bash
# Create backend app
heroku create intervuex-backend

# Create frontend app
heroku create intervuex-frontend

# Add PostgreSQL to backend
heroku addons:create heroku-postgresql:mini -a intervuex-backend
```

### Step 3: Deploy Backend

```bash
# Set environment variables
heroku config:set NODE_ENV=production -a intervuex-backend
heroku config:set OPENAI_API_KEY=sk-proj-... -a intervuex-backend
heroku config:set EMAIL_SERVICE=gmail -a intervuex-backend
heroku config:set EMAIL_USER=intervuex@gmail.com -a intervuex-backend
heroku config:set EMAIL_PASSWORD=bdglokuugbwlkttt -a intervuex-backend
heroku config:set FRONTEND_URL=https://intervuex-frontend.herokuapp.com -a intervuex-backend

# Deploy
cd server
git init
git add .
git commit -m "Deploy backend"
heroku git:remote -a intervuex-backend
git push heroku main

# Run migrations
heroku run node migrations/run.js -a intervuex-backend
```

### Step 4: Deploy Frontend

```bash
# Set environment variable
heroku config:set VITE_API_URL=https://intervuex-backend.herokuapp.com/api -a intervuex-frontend

# Deploy
cd ..
git init
git add .
git commit -m "Deploy frontend"
heroku git:remote -a intervuex-frontend
git push heroku main
```

---

## 🎯 OPTION 4: Deploy to AWS (Advanced)

### Best for: Enterprise, full control, scalability

### Components Needed:
- **EC2** - Backend server
- **RDS** - PostgreSQL database
- **S3** - File storage (resumes)
- **CloudFront** - Frontend CDN
- **Route 53** - Domain management

### Quick Setup:

1. **Launch RDS PostgreSQL instance**
2. **Launch EC2 instance** (Ubuntu)
3. **Install Node.js and PostgreSQL client**
4. **Clone repository and setup backend**
5. **Use PM2 for process management**
6. **Build frontend and upload to S3**
7. **Configure CloudFront distribution**
8. **Setup Route 53 for custom domain**

---

## 🎯 OPTION 5: Deploy to DigitalOcean

### Best for: VPS hosting, good balance of control and simplicity

### Step 1: Create Droplet

1. **Go to [DigitalOcean.com](https://digitalocean.com)**
2. **Create Droplet**:
   - Image: Ubuntu 22.04
   - Plan: Basic ($6/month)
   - Add SSH key

### Step 2: Setup Server

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/intervuex.git
cd intervuex
```

### Step 3: Setup Database

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE intervuex;
CREATE USER intervuex_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE intervuex TO intervuex_user;
\q

# Run migrations
cd server
psql -U intervuex_user -d intervuex -f migrations/001_initial_schema.sql
psql -U intervuex_user -d intervuex -f migrations/002_add_time_window.sql
```

### Step 4: Setup Backend

```bash
# Install dependencies
cd server
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Start with PM2
pm2 start index.js --name intervuex-backend
pm2 save
pm2 startup
```

### Step 5: Setup Frontend

```bash
# Build frontend
cd ..
npm install
npm run build

# Install nginx
sudo apt-get install nginx

# Configure nginx
sudo nano /etc/nginx/sites-available/intervuex
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /root/intervuex/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/intervuex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📝 Post-Deployment Checklist

After deploying, verify:

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Recruiter can register/login
- [ ] Recruiter can add candidates
- [ ] Recruiter can schedule interviews
- [ ] Email notifications sent
- [ ] Candidate can access interview link
- [ ] Face detection works
- [ ] Speech-to-text works
- [ ] Interview submission works
- [ ] Reports generate correctly

---

## 🔒 Security Recommendations

1. **Use HTTPS** - Always use SSL certificates
2. **Environment Variables** - Never commit secrets to Git
3. **Database** - Use strong passwords, enable SSL
4. **API Keys** - Rotate regularly
5. **CORS** - Restrict to your domain only
6. **Rate Limiting** - Already implemented
7. **Input Validation** - Already implemented

---

## 📊 Monitoring & Maintenance

### Recommended Tools:
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics
- **Logs**: Papertrail, Loggly

### Regular Tasks:
- Monitor database size
- Check error logs
- Update dependencies
- Backup database weekly
- Review API usage (OpenAI costs)

---

## 💰 Cost Estimates

### Free Tier (Development):
- Vercel: Free
- Railway: $5/month (database)
- Total: **$5/month**

### Small Business:
- Render: $7/month (backend) + $7/month (database)
- Vercel: Free (frontend)
- Total: **$14/month**

### Enterprise:
- AWS: $50-200/month (depending on usage)
- Custom domain: $12/year
- Total: **$50-200/month**

---

## 🆘 Troubleshooting

### Frontend can't connect to backend:
- Check VITE_API_URL is correct
- Verify CORS settings in backend
- Check backend is running

### Database connection fails:
- Verify database credentials
- Check database is running
- Ensure migrations ran successfully

### Emails not sending:
- Verify Gmail App Password
- Check EMAIL_SERVICE is 'gmail'
- Test with console logs first

---

## 📞 Support

Need help deploying? Check:
- GitHub Issues
- Documentation
- Community forums

---

**CHOOSE YOUR DEPLOYMENT OPTION AND GET STARTED!** 🚀
