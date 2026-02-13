/**
 * Authentication Routes
 */

import express from 'express';
import {
  candidateLogin,
  recruiterLogin,
  recruiterRegister,
  verifyToken,
  generateInterviewLink
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Candidate authentication
router.post('/candidate/login', candidateLogin);

// Recruiter authentication
router.post('/recruiter/login', recruiterLogin);
router.post('/recruiter/register', recruiterRegister);

// Token verification
router.get('/verify', verifyToken);

// Generate interview link (protected - recruiter only)
router.post('/generate-link', authenticate, generateInterviewLink);

export default router;
