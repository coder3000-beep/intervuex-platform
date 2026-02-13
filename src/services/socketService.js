/**
 * WebSocket Service
 * Real-time proctoring events
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(sessionId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(`${SOCKET_URL}/proctoring`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.socket.emit('join-session', { sessionId });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Emit face detection event
  emitFaceDetection(faceCount, screenshot = null) {
    if (this.socket && this.connected) {
      this.socket.emit('face-detection', {
        faceCount,
        timestamp: new Date().toISOString(),
        screenshot
      });
    }
  }

  // Emit noise detection event
  emitNoiseDetection(noiseType, confidence) {
    if (this.socket && this.connected) {
      this.socket.emit('noise-detection', {
        noiseType,
        confidence,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Emit tab switch event
  emitTabSwitch() {
    if (this.socket && this.connected) {
      this.socket.emit('tab-switch', {
        timestamp: new Date().toISOString()
      });
    }
  }

  // Emit window blur event
  emitWindowBlur(duration) {
    if (this.socket && this.connected) {
      this.socket.emit('window-blur', {
        duration,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Emit copy-paste event
  emitCopyPaste(action) {
    if (this.socket && this.connected) {
      this.socket.emit('copy-paste', {
        action,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Emit phone detected event
  emitPhoneDetected(screenshot) {
    if (this.socket && this.connected) {
      this.socket.emit('phone-detected', {
        timestamp: new Date().toISOString(),
        screenshot
      });
    }
  }

  // Emit looking away event
  emitLookingAway(duration) {
    if (this.socket && this.connected) {
      this.socket.emit('looking-away', {
        duration,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Listen for violation alerts (for recruiter dashboard)
  onViolation(callback) {
    if (this.socket) {
      this.socket.on('violation', callback);
    }
  }

  // Monitor session (for recruiters)
  monitorSession(sessionId) {
    if (this.socket && this.connected) {
      this.socket.emit('monitor-session', { sessionId });
    }
  }
}

export default new SocketService();
