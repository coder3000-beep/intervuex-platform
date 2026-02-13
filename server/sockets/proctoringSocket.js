/**
 * Proctoring WebSocket Handler
 * Real-time proctoring event handling
 */

import { query } from '../config/database.js';

export const setupProctoringSocket = (io) => {
  const proctoringNamespace = io.of('/proctoring');

  proctoringNamespace.on('connection', (socket) => {
    console.log(`Proctoring client connected: ${socket.id}`);

    let sessionId = null;

    // Join session room
    socket.on('join-session', (data) => {
      sessionId = data.sessionId;
      socket.join(`session-${sessionId}`);
      console.log(`Client ${socket.id} joined session ${sessionId}`);
    });

    // Handle face detection events
    socket.on('face-detection', async (data) => {
      try {
        const { faceCount, timestamp, screenshot } = data;

        // Log violation if multiple faces or no face
        if (faceCount > 1) {
          await logViolation(sessionId, {
            type: 'MULTIPLE_FACES',
            severity: 'CRITICAL',
            details: { faceCount },
            timestamp,
            screenshot
          });

          // Notify recruiter
          proctoringNamespace.to(`recruiter-${sessionId}`).emit('violation', {
            type: 'MULTIPLE_FACES',
            severity: 'CRITICAL',
            timestamp,
            faceCount
          });
        } else if (faceCount === 0) {
          await logViolation(sessionId, {
            type: 'NO_FACE',
            severity: 'HIGH',
            details: { faceCount: 0 },
            timestamp,
            screenshot
          });

          proctoringNamespace.to(`recruiter-${sessionId}`).emit('violation', {
            type: 'NO_FACE',
            severity: 'HIGH',
            timestamp
          });
        }
      } catch (error) {
        console.error('Face detection event error:', error);
      }
    });

    // Handle noise detection events
    socket.on('noise-detection', async (data) => {
      try {
        const { noiseType, confidence, timestamp } = data;

        // Log violation for human speech
        if (noiseType === 'HUMAN_SPEECH' || noiseType === 'SECOND_VOICE') {
          await logViolation(sessionId, {
            type: 'SECOND_VOICE',
            severity: 'CRITICAL',
            details: { noiseType, confidence },
            timestamp
          });

          proctoringNamespace.to(`recruiter-${sessionId}`).emit('violation', {
            type: 'SECOND_VOICE',
            severity: 'CRITICAL',
            timestamp,
            confidence
          });
        } else if (noiseType === 'BACKGROUND_NOISE') {
          await logViolation(sessionId, {
            type: 'BACKGROUND_NOISE',
            severity: 'MEDIUM',
            details: { noiseType, confidence },
            timestamp
          });
        }
      } catch (error) {
        console.error('Noise detection event error:', error);
      }
    });

    // Handle tab switch events
    socket.on('tab-switch', async (data) => {
      try {
        const { timestamp } = data;

        await logViolation(sessionId, {
          type: 'TAB_SWITCH',
          severity: 'HIGH',
          details: {},
          timestamp
        });

        proctoringNamespace.to(`recruiter-${sessionId}`).emit('violation', {
          type: 'TAB_SWITCH',
          severity: 'HIGH',
          timestamp
        });
      } catch (error) {
        console.error('Tab switch event error:', error);
      }
    });

    // Handle window blur events
    socket.on('window-blur', async (data) => {
      try {
        const { timestamp, duration } = data;

        await logViolation(sessionId, {
          type: 'WINDOW_BLUR',
          severity: 'MEDIUM',
          details: { duration },
          timestamp
        });
      } catch (error) {
        console.error('Window blur event error:', error);
      }
    });

    // Handle copy-paste events
    socket.on('copy-paste', async (data) => {
      try {
        const { action, timestamp } = data;

        await logViolation(sessionId, {
          type: 'COPY_PASTE',
          severity: 'MEDIUM',
          details: { action },
          timestamp
        });

        proctoringNamespace.to(`recruiter-${sessionId}`).emit('violation', {
          type: 'COPY_PASTE',
          severity: 'MEDIUM',
          timestamp,
          action
        });
      } catch (error) {
        console.error('Copy-paste event error:', error);
      }
    });

    // Handle phone detection events
    socket.on('phone-detected', async (data) => {
      try {
        const { timestamp, screenshot } = data;

        await logViolation(sessionId, {
          type: 'PHONE_DETECTED',
          severity: 'HIGH',
          details: {},
          timestamp,
          screenshot
        });

        proctoringNamespace.to(`recruiter-${sessionId}`).emit('violation', {
          type: 'PHONE_DETECTED',
          severity: 'HIGH',
          timestamp
        });
      } catch (error) {
        console.error('Phone detection event error:', error);
      }
    });

    // Handle looking away events
    socket.on('looking-away', async (data) => {
      try {
        const { duration, timestamp } = data;

        if (duration > 5000) { // More than 5 seconds
          await logViolation(sessionId, {
            type: 'LOOKING_AWAY',
            severity: 'LOW',
            details: { duration },
            timestamp
          });
        }
      } catch (error) {
        console.error('Looking away event error:', error);
      }
    });

    // Recruiter monitoring
    socket.on('monitor-session', (data) => {
      const { sessionId: monitorSessionId } = data;
      socket.join(`recruiter-${monitorSessionId}`);
      console.log(`Recruiter monitoring session ${monitorSessionId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Proctoring client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Log violation to database
 */
const logViolation = async (sessionId, violation) => {
  try {
    await query(
      `INSERT INTO violations (
        session_id, type, severity, details, timestamp, screenshot
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sessionId,
        violation.type,
        violation.severity,
        JSON.stringify(violation.details),
        violation.timestamp || new Date(),
        violation.screenshot || null
      ]
    );

    console.log(`Violation logged: ${violation.type} for session ${sessionId}`);
  } catch (error) {
    console.error('Log violation error:', error);
  }
};
