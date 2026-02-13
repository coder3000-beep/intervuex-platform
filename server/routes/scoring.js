/**
 * Scoring Routes
 */

import express from 'express';
import { getScoreBreakdown } from '../services/scoringEngine.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get score breakdown for a session
router.get('/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const breakdown = await getScoreBreakdown(sessionId);

    if (!breakdown) {
      return res.status(404).json({ error: 'Scores not found' });
    }

    res.json(breakdown);
  } catch (error) {
    console.error('Get score breakdown error:', error);
    res.status(500).json({ error: 'Failed to get scores' });
  }
});

export default router;
