import express from 'express';
import { authenticateSession } from '../middleware/auth.js';
import * as proctoringController from '../controllers/proctoringController.js';

const router = express.Router();

// Log violation
router.post('/violation', authenticateSession, proctoringController.logViolation);

// Upload screenshot
router.post('/screenshot', authenticateSession, proctoringController.uploadScreenshot);

// Get violations
router.get('/violations/:sessionId', authenticateSession, proctoringController.getViolations);

// Heartbeat
router.post('/heartbeat', authenticateSession, proctoringController.heartbeat);

export default router;
