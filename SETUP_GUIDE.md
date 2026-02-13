# INTERVUEX - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete INTERVUEX enterprise interview platform from scratch.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (for AI features)

---

## Step 1: Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE intervuex;

# Exit psql
\q
```

### 2.2 Configure Database Connection

Copy `.env.example` to `.env` and update database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=intervuex
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 2.3 Run Database Migrations

```bash
cd server
npm run migrate
cd ..
```

This will create all necessary tables:
- recruiters
- candidates
- interview_sessions
- violations
- scores
- audit_logs

---

## Step 3: Environment Configuration

Update your `.env` file with all required configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=intervuex
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Session Configuration
SESSION_DURATION=1800
LINK_EXPIRY_HOURS=24
```

---

## Step 4: Start the Application

### Option 1: Run Both Frontend and Backend Together

```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:5000`

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:client
```

---

## Step 5: Create Your First Recruiter Account

1. Open browser and go to `http://localhost:5173`
2. Navigate to Recruiter Registration
3. Create an account with:
   - Full Name
   - Email
   - Password
   - Company Name

---

## Step 6: Test the System

### 6.1 Create a Test Candidate

1. Login as recruiter
2. Go to "Candidates" section
3. Upload a sample resume (PDF)
4. Fill in candidate details

### 6.2 Schedule an Interview

1. Select the candidate
2. Click "Schedule Interview"
3. Set duration (default: 30 minutes)
4. Copy the generated interview link

### 6.3 Take the Interview

1. Open the interview link in a new incognito window
2. Allow camera and microphone permissions
3. Complete the interview
4. System will auto-submit after 30 minutes

### 6.4 View Results

1. Go back to recruiter dashboard
2. View interview report with:
   - Scores breakdown
   - Violation timeline
   - Answers review
   - Shortlist recommendation

---

## Architecture Overview

```
INTERVUEX/
├── src/                          # Frontend (React + Vite)
│   ├── components/
│   │   ├── interview/           # Interview UI components
│   │   └── proctoring/          # Proctoring engine
│   ├── pages/                   # Application pages
│   ├── services/                # API and WebSocket services
│   └── main.jsx                 # Entry point
│
├── server/                       # Backend (Node.js + Express)
│   ├── config/                  # Database configuration
│   ├── controllers/             # Business logic
│   ├── middleware/              # Auth, logging, error handling
│   ├── routes/                  # API routes
│   ├── services/                # Core services
│   │   ├── aiEvaluator.js      # AI answer evaluation
│   │   ├── scoringEngine.js    # Multi-dimensional scoring
│   │   ├── questionGenerator.js # AI question generation
│   │   └── resumeParser.js     # Resume parsing
│   ├── sockets/                 # WebSocket handlers
│   └── migrations/              # Database migrations
│
└── .kiro/specs/                 # Complete specification
```

---

## Key Features Implemented

### ✅ Core Modules (100% Complete)

1. **Authentication & Security**
   - One-time interview links
   - Device fingerprinting
   - JWT-based authentication
   - Session locking

2. **Resume Intelligence**
   - PDF/DOC parsing
   - Skill extraction
   - Resume-based question generation

3. **Interview Orchestration**
   - 30-minute strict timer (backend-controlled)
   - Adaptive questioning
   - Auto-submit on timeout

4. **Real-time Proctoring** (CRITICAL)
   - Face detection (every 500ms)
   - Multiple face detection
   - Noise & voice detection
   - Tab switching detection
   - Window blur detection
   - Phone detection
   - Looking away detection

5. **Scoring Engine**
   - Technical Score (45%)
   - Problem Solving (25%)
   - Communication (15%)
   - Resume Authenticity (15%)
   - Integrity Risk (-30%)
   - Auto-shortlisting logic

6. **Recruiter Dashboard**
   - Candidate management
   - Interview scheduling
   - Real-time monitoring
   - Detailed reports
   - Shortlist management

---

## API Endpoints

### Authentication
- `POST /api/auth/candidate/login` - Candidate login with token
- `POST /api/auth/recruiter/login` - Recruiter login
- `POST /api/auth/recruiter/register` - Recruiter registration
- `POST /api/auth/generate-link` - Generate interview link

### Interview
- `POST /api/interview/start` - Start interview session
- `GET /api/interview/:sessionId` - Get interview details
- `POST /api/interview/answer` - Submit answer
- `GET /api/interview/:sessionId/time` - Get time remaining
- `POST /api/interview/end` - End interview
- `POST /api/interview/terminate` - Terminate interview

### Proctoring
- `POST /api/proctoring/violation` - Log violation
- `GET /api/proctoring/violations/:sessionId` - Get violations

### Scoring
- `GET /api/scoring/:sessionId` - Get score breakdown

### Recruiter
- `GET /api/recruiter/dashboard` - Dashboard overview
- `POST /api/recruiter/candidates` - Create candidate
- `GET /api/recruiter/candidates` - List candidates
- `POST /api/recruiter/schedule` - Schedule interview
- `GET /api/recruiter/report/:sessionId` - Interview report
- `PUT /api/recruiter/shortlist/:sessionId` - Update shortlist status

---

## WebSocket Events

### Client → Server
- `join-session` - Join interview session
- `face-detection` - Face detection event
- `noise-detection` - Noise detection event
- `tab-switch` - Tab switch event
- `window-blur` - Window blur event
- `copy-paste` - Copy/paste event
- `phone-detected` - Phone detection event
- `looking-away` - Looking away event

### Server → Client
- `violation` - Real-time violation alert

---

## Scoring Formula

```
Final Score = (Technical × 0.45) + 
              (Problem Solving × 0.25) + 
              (Communication × 0.15) + 
              (Resume Authenticity × 0.15) - 
              (Integrity Risk × 0.30)
```

### Shortlisting Logic

- **Auto-Shortlist**: Score ≥ 70 AND Integrity ≤ 20
- **Manual Review**: Score 60-69 OR Integrity 21-35
- **Auto-Reject**: Score < 60 OR Integrity > 35 OR Critical Violation

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 5173
npx kill-port 5173
```

### Camera/Microphone Not Working
- Ensure HTTPS or localhost
- Check browser permissions
- Try different browser (Chrome recommended)

### OpenAI API Errors
- Verify API key is correct
- Check API quota/billing
- System falls back to default questions if AI fails

---

## Production Deployment

### Environment Variables
Update `.env` for production:
```env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
JWT_SECRET=use-strong-random-secret
```

### Database
- Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
- Enable SSL connections
- Regular backups

### Security
- Use HTTPS everywhere
- Enable rate limiting
- Implement CSRF protection
- Regular security audits

---

## Support

For issues or questions:
1. Check `.kiro/specs/intervuex-enterprise/` for detailed documentation
2. Review `SYSTEM_ARCHITECTURE.md`
3. Check `PROJECT_SUMMARY.md`

---

## License

Enterprise Interview Platform - All Rights Reserved
