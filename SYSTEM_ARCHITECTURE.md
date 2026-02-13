# INTERVUEX - System Architecture Documentation

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERVUEX PLATFORM                            │
│                  Enterprise Virtual Interview System                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   CANDIDATE CLIENT   │◄───────►│   RECRUITER CLIENT   │
│   (React Frontend)   │         │   (React Frontend)   │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           │         WebSocket (Socket.io)   │
           │                                 │
           └────────────┬────────────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   API GATEWAY LAYER    │
           │   (Express + JWT)      │
           └────────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  INTERVIEW   │ │  PROCTORING  │ │   SCORING    │
│  CONTROLLER  │ │  CONTROLLER  │ │  CONTROLLER  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   RESUME     │ │  VIOLATION   │ │   QUESTION   │
│   PARSER     │ │  ANALYZER    │ │  GENERATOR   │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │   DATABASE LAYER       │
           │   (MongoDB/PostgreSQL) │
           └────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    AI & COMPUTER VISION LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│  • TensorFlow.js (Face Detection)                                   │
│  • Face-API.js (Multiple Face Detection & Recognition)              │
│  • COCO-SSD (Object Detection - Phone, Books)                       │
│  • Web Audio API (Noise & Voice Detection)                          │
│  • Natural NLP (Resume Parsing & Skill Extraction)                  │
│  • OpenAI GPT-4 (Question Generation & Answer Evaluation)           │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Architecture

### 1. Interview Initialization Flow
```
Candidate → Login with Token → Verify Session → Load Questions
                                      ↓
                              Initialize Proctoring
                                      ↓
                          Start Face Detection + Noise Detection
                                      ↓
                              Begin Interview Session
```

### 2. Real-Time Proctoring Flow
```
Video Stream → Face Detection (500ms intervals)
                      ↓
              Count Faces → If > 1: VIOLATION
                      ↓
              Capture Screenshot → Store in DB
                      ↓
              Update Integrity Score
                      ↓
              Send Real-time Alert (WebSocket)

Audio Stream → Noise Detection (Continuous)
                      ↓
              Analyze Frequency → Detect Second Voice
                      ↓
              Compare Voice Signatures → If Different: VIOLATION
                      ↓
              Log Audio Event → Update Integrity Score
```

### 3. Answer Submission Flow
```
Candidate Answer → Validate → Store in DB
                                    ↓
                            AI Evaluation (GPT-4)
                                    ↓
                            Calculate Scores:
                            • Technical Score
                            • Communication Score
                            • Confidence Score
                                    ↓
                            Generate Follow-up Questions
                                    ↓
                            Next Question or Complete
```

## 🗄️ Database Schema

### Collections/Tables

#### 1. Candidates
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  phone: String,
  resume: {
    fileUrl: String,
    parsedData: Object,
    skills: [String],
    experience: [Object],
    education: [Object]
  },
  deviceFingerprint: String,
  createdAt: Date
}
```

#### 2. Interviews
```javascript
{
  _id: ObjectId,
  candidateId: ObjectId,
  sessionToken: String (unique, time-bound),
  status: Enum['pending', 'active', 'completed', 'terminated'],
  startTime: Date,
  endTime: Date,
  duration: Number (seconds),
  questions: [
    {
      id: String,
      type: Enum['hr', 'technical', 'scenario', 'coding'],
      question: String,
      difficulty: Enum['easy', 'medium', 'hard'],
      expectedAnswer: String,
      answer: String,
      submittedAt: Date,
      score: Number
    }
  ],
  integrityScore: Number (0-100),
  technicalScore: Number (0-100),
  communicationScore: Number (0-100),
  confidenceScore: Number (0-100),
  overallScore: Number (0-100),
  recommendation: Enum['strong_hire', 'hire', 'maybe', 'no_hire'],
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Violations
```javascript
{
  _id: ObjectId,
  interviewId: ObjectId,
  type: Enum[
    'MULTIPLE_FACES',
    'FACE_DISAPPEARED',
    'FACE_REENTRY',
    'SECOND_VOICE_DETECTED',
    'BACKGROUND_NOISE',
    'TAB_SWITCH',
    'WINDOW_BLUR',
    'COPY_PASTE',
    'DEV_TOOLS',
    'PHONE_DETECTED'
  ],
  severity: Enum['LOW', 'MEDIUM', 'HIGH'],
  timestamp: Date,
  message: String,
  screenshot: String (base64 or URL),
  audioData: Object,
  metadata: Object,
  impactScore: Number,
  resolved: Boolean,
  createdAt: Date
}
```

#### 4. Questions
```javascript
{
  _id: ObjectId,
  category: Enum['hr', 'technical', 'scenario', 'coding'],
  difficulty: Enum['easy', 'medium', 'hard'],
  question: String,
  expectedAnswer: String,
  keywords: [String],
  skills: [String],
  evaluationCriteria: Object,
  createdAt: Date
}
```

#### 5. Scores
```javascript
{
  _id: ObjectId,
  interviewId: ObjectId,
  candidateId: ObjectId,
  scores: {
    technical: Number,
    communication: Number,
    confidence: Number,
    integrity: Number,
    resumeAuthenticity: Number,
    overall: Number
  },
  breakdown: {
    hrQuestions: Number,
    technicalQuestions: Number,
    codingChallenges: Number,
    scenarioQuestions: Number
  },
  strengths: [String],
  weaknesses: [String],
  recommendation: String,
  aiSummary: String,
  createdAt: Date
}
```

## 🔐 Security Architecture

### 1. Authentication & Authorization
```
JWT Token → Verify → Check Expiry → Validate Device
                                          ↓
                                  Session Locking
                                          ↓
                              One Device Per Session
```

### 2. Session Security
- One-time use tokens
- Time-bound sessions (expire after duration)
- Device fingerprinting
- IP address validation
- Prevent multiple logins

### 3. Data Encryption
- Passwords: bcrypt (10 rounds)
- Sensitive data: AES-256
- File uploads: Encrypted storage
- Database: Encryption at rest

### 4. API Security
- Rate limiting (100 requests/15 minutes)
- CORS restrictions
- Helmet security headers
- Input validation & sanitization
- SQL injection prevention
- XSS protection

## 🎯 Proctoring Engine Architecture

### Face Detection Pipeline
```
Initialize Face-API.js Models
        ↓
Load TinyFaceDetector + FaceLandmark68Net
        ↓
Start Video Stream (30 FPS)
        ↓
Detect Faces Every 500ms
        ↓
Count Faces → Store Count
        ↓
If Faces > 1:
    • Capture Screenshot
    • Log Violation (HIGH)
    • Impact Score: -15
    • Send Alert
        ↓
If Faces = 0:
    • Start Timer
    • If > 5 seconds:
        - Log Violation (MEDIUM)
        - Impact Score: -5
        ↓
Update Integrity Score
        ↓
Send to Backend via WebSocket
```

### Noise Detection Pipeline
```
Initialize AudioContext
        ↓
Create AnalyserNode (FFT Size: 2048)
        ↓
Connect Microphone Stream
        ↓
Continuous Analysis (60 FPS)
        ↓
Calculate Volume & Frequency
        ↓
Detect Speech (85-8000 Hz)
        ↓
Extract Voice Signature:
    • Volume Pattern
    • Frequency Pattern
    • Harmonic Structure
        ↓
Compare with Baseline
        ↓
If Similarity < 70%:
    • Second Voice Detected
    • Log Violation (HIGH)
    • Impact Score: -10
    • Send Alert
        ↓
If Background Noise > Threshold:
    • Log Violation (MEDIUM)
    • Impact Score: -5
        ↓
Update Integrity Score
        ↓
Send to Backend via WebSocket
```

## 📡 WebSocket Events

### Client → Server
```javascript
// Connection
'connect' → { sessionId, token }

// Violations
'violation' → { type, severity, data, timestamp }

// Heartbeat
'heartbeat' → { sessionId, timestamp }

// Answer submission
'submit_answer' → { questionId, answer, timestamp }
```

### Server → Client
```javascript
// Violation acknowledgment
'violation_logged' → { violationId, integrityScore }

// Real-time alerts
'alert' → { message, severity, action }

// Next question
'next_question' → { question, questionNumber }

// Session termination
'terminate' → { reason, finalScore }
```

## 🚀 Deployment Architecture

### Production Setup
```
┌─────────────────────────────────────────┐
│         LOAD BALANCER (Nginx)           │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────┐
│ Server 1│      │ Server 2│
│ Node.js │      │ Node.js │
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              │
              ▼
     ┌────────────────┐
     │   MongoDB      │
     │   Replica Set  │
     └────────────────┘
```

### Scaling Strategy
- Horizontal scaling with load balancer
- WebSocket sticky sessions
- Redis for session management
- CDN for static assets
- Database replication
- Auto-scaling based on load

## 📊 Performance Metrics

### Target Performance
- Face Detection: < 100ms per frame
- Noise Detection: Real-time (< 50ms latency)
- API Response: < 200ms
- WebSocket Latency: < 100ms
- Page Load: < 2 seconds
- Video Stream: 30 FPS minimum

### Monitoring
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Uptime monitoring
- Resource utilization

## 🔄 Backup & Recovery

### Data Backup
- Automated daily backups
- Point-in-time recovery
- Geo-redundant storage
- 30-day retention

### Disaster Recovery
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes
- Automated failover
- Regular DR drills

---

**This architecture is designed for enterprise-scale deployment with high availability, security, and performance.**
