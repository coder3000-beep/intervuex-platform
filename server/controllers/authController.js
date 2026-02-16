/**
 * Authentication Controller
 * Handles candidate and recruiter authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'intervuex-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Candidate Login with One-Time Link
 */
export const candidateLogin = async (req, res) => {
  try {
    const { token, deviceFingerprint } = req.body;

    // Verify token exists and is valid
    const result = await query(
      `SELECT s.*, c.email, c.full_name 
       FROM interview_sessions s
       JOIN candidates c ON s.candidate_id = c.id
       WHERE s.access_token = $1 AND s.status = 'scheduled'`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired interview link' });
    }

    const session = result.rows[0];
    const now = new Date();

    // Check time window if specified
    if (session.valid_from && session.valid_until) {
      const validFrom = new Date(session.valid_from);
      const validUntil = new Date(session.valid_until);

      if (now < validFrom) {
        return res.status(403).json({ 
          error: `Interview link is not yet active. Please try again after ${validFrom.toLocaleString()}`,
          code: 'NOT_YET_ACTIVE',
          validFrom: validFrom.toISOString()
        });
      }

      if (now > validUntil) {
        return res.status(403).json({ 
          error: `Interview link has expired. The interview window was from ${validFrom.toLocaleString()} to ${validUntil.toLocaleString()}`,
          code: 'TIME_WINDOW_EXPIRED',
          validUntil: validUntil.toISOString()
        });
      }
    } else {
      // Check standard expiration if no time window
      const expiresAt = new Date(session.expires_at);
      if (now > expiresAt) {
        return res.status(401).json({ error: 'Interview link has expired' });
      }
    }

    // Check if already accessed from different device (disabled for testing)
    // if (session.device_fingerprint && session.device_fingerprint !== JSON.stringify(deviceFingerprint)) {
    //   return res.status(403).json({ 
    //     error: 'This interview has already been accessed from another device',
    //     code: 'DEVICE_MISMATCH'
    //   });
    // }

    // Generate JWT for session
    const jwtToken = jwt.sign(
      { 
        id: session.candidate_id, 
        sessionId: session.id,
        type: 'candidate'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update device fingerprint if first access
    if (!session.device_fingerprint) {
      await query(
        'UPDATE interview_sessions SET device_fingerprint = $1 WHERE id = $2',
        [JSON.stringify(deviceFingerprint), session.id]
      );
    }

    // Log access
    await query(
      `INSERT INTO audit_logs (user_id, session_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [session.candidate_id, session.id, 'CANDIDATE_LOGIN', JSON.stringify({ deviceFingerprint }), req.ip]
    );

    res.json({
      success: true,
      token: jwtToken,
      candidate: {
        id: session.candidate_id,
        name: session.full_name,
        email: session.email
      },
      session: {
        id: session.id,
        duration: session.duration_seconds,
        status: session.status
      }
    });
  } catch (error) {
    console.error('Candidate login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Recruiter Login
 */
export const recruiterLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find recruiter
    const result = await query(
      'SELECT * FROM recruiters WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const recruiter = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, recruiter.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: recruiter.id, 
        email: recruiter.email,
        type: 'recruiter'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login
    await query(
      'UPDATE recruiters SET last_login = NOW() WHERE id = $1',
      [recruiter.id]
    );

    res.json({
      success: true,
      token,
      recruiter: {
        id: recruiter.id,
        name: recruiter.full_name,
        email: recruiter.email,
        company: recruiter.company
      }
    });
  } catch (error) {
    console.error('Recruiter login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Recruiter Registration
 */
export const recruiterRegister = async (req, res) => {
  try {
    const { fullName, email, password, company } = req.body;

    console.log('📝 Registration attempt:', { email, fullName, company });

    // Validate input
    if (!fullName || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    console.log('🔍 Checking if email exists...');
    const existing = await query(
      'SELECT id FROM recruiters WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      console.log('❌ Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create recruiter
    console.log('💾 Creating recruiter record...');
    const result = await query(
      `INSERT INTO recruiters (full_name, email, password_hash, company)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, company`,
      [fullName, email, passwordHash, company]
    );

    const recruiter = result.rows[0];
    console.log('✅ Recruiter created:', recruiter.id);

    // Generate JWT
    const token = jwt.sign(
      { 
        id: recruiter.id, 
        email: recruiter.email,
        type: 'recruiter'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('✅ Registration successful');
    res.status(201).json({
      success: true,
      token,
      recruiter: {
        id: recruiter.id,
        name: recruiter.full_name,
        email: recruiter.email,
        company: recruiter.company
      }
    });
  } catch (error) {
    console.error('❌ Recruiter registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify Token
 */
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Generate Interview Link (for recruiters)
 */
export const generateInterviewLink = async (req, res) => {
  try {
    const { candidateId, duration, expiresIn } = req.body;
    const recruiterId = req.user.id;

    // Generate unique access token
    const accessToken = uuidv4();

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expiresIn || 24));

    // Create interview session
    const result = await query(
      `INSERT INTO interview_sessions (
        candidate_id, recruiter_id, access_token, 
        duration_seconds, expires_at, status
      ) VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING id, access_token`,
      [candidateId, recruiterId, accessToken, duration || 1800, expiresAt]
    );

    const session = result.rows[0];

    // Generate interview URL
    const interviewUrl = `${process.env.FRONTEND_URL}/interview/${accessToken}`;

    res.json({
      success: true,
      sessionId: session.id,
      interviewUrl,
      expiresAt
    });
  } catch (error) {
    console.error('Generate link error:', error);
    res.status(500).json({ error: 'Failed to generate interview link' });
  }
};
