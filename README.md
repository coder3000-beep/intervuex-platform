# 🎯 INTERVUEX - AI-Powered Virtual Interview Platform

Enterprise-grade virtual interview platform with real-time AI proctoring, face recognition, and automated candidate evaluation.

## ✨ Features

### 🎥 Real-Time Proctoring
- **Face Detection** - Detects multiple faces and face substitution
- **Face Recognition** - Verifies candidate identity throughout interview
- **Tab Switching Detection** - Monitors window focus
- **Copy/Paste Detection** - Tracks clipboard usage
- **Fullscreen Enforcement** - Ensures interview integrity

### 🤖 AI-Powered Features
- **Speech-to-Text** - Real-time voice transcription
- **Dynamic Questions** - AI generates follow-up questions based on answers
- **Answer Quality Analysis** - Evaluates technical depth and communication
- **Automated Scoring** - Multi-dimensional candidate evaluation

### 📧 Automated Workflows
- **Email Notifications** - Automatic interview invitations
- **Time Windows** - Schedule interviews for specific time slots
- **Resume Parsing** - Extracts skills and experience
- **Report Generation** - Comprehensive interview reports

### 🔒 Security & Integrity
- **One-Time Links** - Secure interview access
- **Device Fingerprinting** - Prevents link sharing
- **Violation Tracking** - Real-time integrity monitoring
- **Audit Logs** - Complete activity tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key
- Gmail account (for emails)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/intervuex.git
cd intervuex

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Setup database
psql -U postgres
CREATE DATABASE intervuex;
\q

# Run migrations
psql -U postgres -d intervuex -f migrations/001_initial_schema.sql
psql -U postgres -d intervuex -f migrations/002_add_time_window.sql

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

cd server
cp .env.example .env
# Edit server/.env with your credentials
```

### Run Development

```bash
# Start both frontend and backend
npm run dev

# Or separately:
# Frontend (from root)
npm run dev:client

# Backend (from root)
npm run dev:server
```

Visit: http://localhost:5173

## 📦 Deployment

See [VERCEL_RENDER_DEPLOYMENT.md](VERCEL_RENDER_DEPLOYMENT.md) for complete deployment guide.

**Recommended Stack:**
- Frontend: Vercel (Free)
- Backend: Render ($7/month)
- Database: Render PostgreSQL ($7/month)

## 🏗️ Architecture

```
intervuex/
├── src/                    # Frontend (React + Vite)
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API & detection services
│   └── main.jsx           # Entry point
├── server/                # Backend (Node.js + Express)
│   ├── controllers/       # Route handlers
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   ├── migrations/        # Database migrations
│   └── index.js           # Server entry
└── public/                # Static assets
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (server/.env)**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=intervuex
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

## 📚 Documentation

- [Deployment Guide](VERCEL_RENDER_DEPLOYMENT.md) - Deploy to Vercel + Render
- [GitHub Setup](PUSH_TO_GITHUB_COMPLETE.md) - Push code to GitHub
- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions

## 🎓 Usage

### For Recruiters

1. **Register** at `/recruiter/register`
2. **Add Candidates** - Upload resumes
3. **Schedule Interviews** - Set time windows or 24-hour expiry
4. **Review Reports** - View scores and violations

### For Candidates

1. **Receive Email** - Interview invitation with link
2. **Accept Terms** - Agree to proctoring conditions
3. **Take Interview** - Answer questions (type or speak)
4. **Submit** - Automatic evaluation and scoring

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router
- Face-API.js
- Web Speech API

**Backend:**
- Node.js
- Express
- PostgreSQL
- Socket.io
- OpenAI API
- Nodemailer
- JWT

## 📊 Scoring System

**Final Score Formula:**
```
(Technical × 0.45) + 
(Problem Solving × 0.25) + 
(Communication × 0.15) + 
(Resume Authenticity × 0.15) - 
(Integrity Risk × 0.30)
```

**Shortlisting Logic:**
- Score ≥70 & Integrity ≤20: **Auto-Shortlist**
- Score 60-69 & Integrity 21-35: **Manual Review**
- Score <60 or Integrity >35: **Auto-Reject**

## 🔐 Security Features

- JWT authentication
- Rate limiting
- CORS protection
- SQL injection prevention
- XSS protection
- HTTPS enforcement
- Environment variable encryption

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📞 Support

For issues and questions:
- GitHub Issues
- Documentation: /docs

## 🎉 Credits

Built with ❤️ for modern recruitment

---

**INTERVUEX** - Transforming Virtual Interviews with AI
