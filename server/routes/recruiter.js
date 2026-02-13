/**
 * Recruiter Routes
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getDashboard,
  createCandidate,
  getCandidates,
  getCandidateDetails,
  getInterviewReport,
  updateShortlistStatus,
  getShortlistedCandidates,
  scheduleInterview,
  deleteCandidate,
  deleteInterview
} from '../controllers/recruiterController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', getDashboard);

// Candidate management
router.post('/candidates', upload.single('resume'), createCandidate);
router.get('/candidates', getCandidates);
router.get('/candidates/:candidateId', getCandidateDetails);
router.delete('/candidates/:candidateId', deleteCandidate);

// Interview management
router.post('/schedule', scheduleInterview);
router.get('/report/:sessionId', getInterviewReport);
router.delete('/interviews/:sessionId', deleteInterview);

// Shortlist management
router.put('/shortlist/:sessionId', updateShortlistStatus);
router.get('/shortlisted', getShortlistedCandidates);

export default router;
