/**
 * NOISE & AUDIO DETECTION SERVICE
 * Continuous microphone monitoring for multiple voices and background noise
 * Detects second human voice, background conversations, and audio anomalies
 */

class NoiseDetectionService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.bufferLength = null;
    this.isMonitoring = false;
    this.violations = [];
    this.onViolation = null;
    
    // Detection thresholds
    this.volumeThreshold = 50; // Minimum volume to consider
    this.speechThreshold = 70; // Volume indicating speech
    this.backgroundNoiseThreshold = 40;
    
    // Voice fingerprinting
    this.baselineVoiceSignature = null;
    this.voiceSignatures = [];
    
    // Monitoring state
    this.consecutiveHighVolume = 0;
    this.lastViolationTime = 0;
    this.violationCooldown = 5000; // 5 seconds between similar violations
  }

  /**
   * Initialize audio monitoring
   */
  async initialize(stream) {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      console.log('✅ Audio monitoring initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio monitoring:', error);
      return false;
    }
  }

  /**
   * Start noise detection monitoring
   * DISABLED - Too sensitive to normal background noise (fan, AC, etc.)
   */
  startMonitoring(onViolationCallback) {
    this.onViolation = onViolationCallback;
    this.isMonitoring = false; // DISABLED
    
    console.log('🎤 Noise detection DISABLED (too sensitive to background noise)');
  }

  /**
   * Continuous audio monitoring loop
   */
  monitorAudio() {
    if (!this.isMonitoring) return;

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate audio metrics
    const volume = this.calculateVolume();
    const frequency = this.calculateDominantFrequency();
    const speechDetected = this.detectSpeech(volume, frequency);
    
    // Analyze for violations
    if (speechDetected) {
      this.analyzeSpeechPattern(volume, frequency);
    }
    
    // Detect background noise
    this.detectBackgroundNoise(volume);
    
    // Continue monitoring
    requestAnimationFrame(() => this.monitorAudio());
  }

  /**
   * Calculate average volume
   */
  calculateVolume() {
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.bufferLength;
  }

  /**
   * Calculate dominant frequency
   */
  calculateDominantFrequency() {
    let maxValue = 0;
    let maxIndex = 0;
    
    for (let i = 0; i < this.bufferLength; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    
    // Convert index to frequency
    return (maxIndex * this.audioContext.sampleRate) / (this.analyser.fftSize * 2);
  }

  /**
   * Detect if current audio is speech
   */
  detectSpeech(volume, frequency) {
    // Human speech typically ranges from 85-255 Hz (fundamental frequency)
    // with harmonics up to 8000 Hz
    const isHumanSpeechRange = frequency >= 85 && frequency <= 8000;
    const isSpeechVolume = volume >= this.speechThreshold;
    
    return isHumanSpeechRange && isSpeechVolume;
  }

  /**
   * Analyze speech pattern for multiple voices
   */
  analyzeSpeechPattern(volume, frequency) {
    const timestamp = new Date().toISOString();
    const now = Date.now();
    
    // Create voice signature
    const voiceSignature = {
      volume,
      frequency,
      timestamp: now,
      pattern: this.extractVoicePattern()
    };

    // If this is the first speech, set as baseline
    if (!this.baselineVoiceSignature) {
      this.baselineVoiceSignature = voiceSignature;
      console.log('📊 Baseline voice signature captured');
      return;
    }

    // Compare with baseline to detect different voice
    const similarity = this.compareVoiceSignatures(
      this.baselineVoiceSignature,
      voiceSignature
    );

    // VIOLATION: Different voice detected (similarity < 70%)
    if (similarity < 0.7) {
      // Check cooldown to avoid spam
      if (now - this.lastViolationTime > this.violationCooldown) {
        const violation = {
          type: 'SECOND_VOICE_DETECTED',
          severity: 'HIGH',
          timestamp,
          similarity: (similarity * 100).toFixed(1) + '%',
          message: 'Different human voice detected',
          audioMetrics: {
            volume: volume.toFixed(2),
            frequency: frequency.toFixed(2)
          },
          impactScore: 10
        };

        this.violations.push(violation);
        
        if (this.onViolation) {
          this.onViolation(violation);
        }

        this.lastViolationTime = now;
        console.warn('⚠️ VIOLATION: Second voice detected, similarity:', similarity);
      }
    }

    // Store voice signature
    this.voiceSignatures.push(voiceSignature);
    
    // Keep only last 100 signatures
    if (this.voiceSignatures.length > 100) {
      this.voiceSignatures.shift();
    }
  }

  /**
   * Extract voice pattern from frequency data
   */
  extractVoicePattern() {
    // Extract key frequency bands for voice fingerprinting
    const pattern = [];
    const bands = [
      [0, 255],      // Sub-bass
      [256, 511],    // Bass
      [512, 1023],   // Low midrange
      [1024, 2047]   // High midrange
    ];

    bands.forEach(([start, end]) => {
      let sum = 0;
      for (let i = start; i <= end && i < this.bufferLength; i++) {
        sum += this.dataArray[i];
      }
      pattern.push(sum / (end - start + 1));
    });

    return pattern;
  }

  /**
   * Compare two voice signatures
   */
  compareVoiceSignatures(sig1, sig2) {
    // Compare frequency patterns
    const pattern1 = sig1.pattern;
    const pattern2 = sig2.pattern;
    
    let similarity = 0;
    for (let i = 0; i < pattern1.length; i++) {
      const diff = Math.abs(pattern1[i] - pattern2[i]);
      const maxVal = Math.max(pattern1[i], pattern2[i]);
      similarity += (1 - (diff / maxVal)) / pattern1.length;
    }

    // Factor in frequency similarity
    const freqDiff = Math.abs(sig1.frequency - sig2.frequency);
    const freqSimilarity = 1 - (freqDiff / 8000); // Normalize by max speech frequency
    
    return (similarity * 0.7) + (freqSimilarity * 0.3);
  }

  /**
   * Detect background noise and conversations
   */
  detectBackgroundNoise(volume) {
    const timestamp = new Date().toISOString();
    const now = Date.now();

    // Detect sustained background noise
    if (volume >= this.backgroundNoiseThreshold && volume < this.speechThreshold) {
      this.consecutiveHighVolume++;

      // If background noise sustained for 3 seconds (assuming 60fps)
      if (this.consecutiveHighVolume > 180) {
        if (now - this.lastViolationTime > this.violationCooldown) {
          const violation = {
            type: 'BACKGROUND_NOISE',
            severity: 'MEDIUM',
            timestamp,
            message: 'Sustained background noise detected',
            audioMetrics: {
              volume: volume.toFixed(2),
              duration: (this.consecutiveHighVolume / 60).toFixed(1) + 's'
            },
            impactScore: 5
          };

          this.violations.push(violation);
          
          if (this.onViolation) {
            this.onViolation(violation);
          }

          this.lastViolationTime = now;
          console.warn('⚠️ VIOLATION: Background noise detected');
        }
        
        this.consecutiveHighVolume = 0;
      }
    } else {
      this.consecutiveHighVolume = 0;
    }
  }

  /**
   * Get all violations
   */
  getViolations() {
    return this.violations;
  }

  /**
   * Calculate integrity impact score
   */
  calculateIntegrityImpact() {
    return this.violations.reduce((total, v) => total + v.impactScore, 0);
  }

  /**
   * Stop noise detection
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.microphone) {
      this.microphone.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }

    console.log('🛑 Noise detection stopped');
  }

  /**
   * Reset detection state
   */
  reset() {
    this.violations = [];
    this.baselineVoiceSignature = null;
    this.voiceSignatures = [];
    this.consecutiveHighVolume = 0;
    this.lastViolationTime = 0;
  }
}

export default new NoiseDetectionService();
