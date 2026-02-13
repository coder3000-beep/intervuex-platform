/**
 * Scoring Engine
 * Multi-dimensional candidate evaluation and scoring
 */

import { query } from '../config/database.js';
import { evaluateWithAI } from './aiEvaluator.js';

/**
 * Calculate all scores for a completed interview
 */
export const calculateScores = async (sessionId) => {
  try {
    // Get session data
    const sessionResult = await query(
      `SELECT s.*, c.resume_parsed_data, c.skills
       FROM interview_sessions s
       JOIN candidates c ON s.candidate_id = c.id
       WHERE s.id = $1`,
      [sessionId]
    );

    const session = sessionResult.rows[0];
    const questions = session.questions;
    const answers = session.answers || [];

    // Get violations
    const violationsResult = await query(
      `SELECT * FROM violations WHERE session_id = $1`,
      [sessionId]
    );
    const violations = violationsResult.rows;

    // Calculate individual scores
    const technicalScore = await calculateTechnicalScore(questions, answers, session.resume_parsed_data);
    const problemSolvingScore = await calculateProblemSolvingScore(questions, answers);
    const communicationScore = await calculateCommunicationScore(answers);
    const confidenceScore = await calculateConfidenceScore(answers, violations);
    const resumeAuthenticityScore = await calculateResumeAuthenticityScore(
      questions,
      answers,
      session.resume_parsed_data
    );
    const integrityRiskScore = calculateIntegrityRiskScore(violations);

    // Calculate final score using weighted formula
    const finalScore = calculateFinalScore({
      technical: technicalScore,
      problemSolving: problemSolvingScore,
      communication: communicationScore,
      resumeAuthenticity: resumeAuthenticityScore,
      integrityRisk: integrityRiskScore
    });

    // Determine shortlist status
    const shortlistStatus = determineShortlistStatus(finalScore, integrityRiskScore, violations);

    return {
      technical: technicalScore,
      problemSolving: problemSolvingScore,
      communication: communicationScore,
      confidence: confidenceScore,
      resumeAuthenticity: resumeAuthenticityScore,
      integrityRisk: integrityRiskScore,
      final: finalScore,
      shortlistStatus
    };
  } catch (error) {
    console.error('Calculate scores error:', error);
    throw error;
  }
};

/**
 * Calculate Technical Skill Score (0-100)
 */
const calculateTechnicalScore = async (questions, answers, resumeData) => {
  let totalScore = 0;
  let technicalQuestions = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.type === 'technical' || question.type === 'coding') {
      technicalQuestions++;
      const answer = answers.find(a => a.questionId === question.id);
      
      if (answer) {
        // Use AI to evaluate technical accuracy
        const evaluation = await evaluateWithAI(question.question, answer.answer, question.expectedAnswer);
        totalScore += evaluation.score;
      }
    }
  }

  return technicalQuestions > 0 ? Math.round(totalScore / technicalQuestions) : 0;
};

/**
 * Calculate Problem Solving Score (0-100)
 */
const calculateProblemSolvingScore = async (questions, answers) => {
  let totalScore = 0;
  let problemQuestions = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.type === 'scenario' || question.type === 'coding') {
      problemQuestions++;
      const answer = answers.find(a => a.questionId === question.id);
      
      if (answer) {
        // Evaluate approach, logic, and optimization
        const evaluation = await evaluateWithAI(
          question.question,
          answer.answer,
          question.expectedAnswer,
          { evaluateApproach: true }
        );
        totalScore += evaluation.score;
      }
    }
  }

  return problemQuestions > 0 ? Math.round(totalScore / problemQuestions) : 0;
};

/**
 * Calculate Communication Score (0-100)
 */
const calculateCommunicationScore = (answers) => {
  if (answers.length === 0) return 0;

  let totalScore = 0;

  answers.forEach(answer => {
    let score = 50; // Base score

    // Check answer length (not too short, not too long)
    const wordCount = answer.answer.split(' ').length;
    if (wordCount >= 30 && wordCount <= 200) {
      score += 20;
    } else if (wordCount < 10) {
      score -= 20;
    }

    // Check for structure (paragraphs, bullet points)
    if (answer.answer.includes('\n') || answer.answer.includes('•')) {
      score += 15;
    }

    // Check for clarity (no excessive filler words)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically'];
    const fillerCount = fillerWords.reduce((count, word) => {
      return count + (answer.answer.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    }, 0);
    if (fillerCount < 3) {
      score += 15;
    }

    totalScore += Math.min(100, Math.max(0, score));
  });

  return Math.round(totalScore / answers.length);
};

/**
 * Calculate Confidence Score (0-100)
 */
const calculateConfidenceScore = (answers, violations) => {
  let score = 100;

  // Penalize for hesitation (detected from silence violations)
  const hesitationViolations = violations.filter(v => 
    v.type === 'SILENCE' || v.type === 'HESITATION'
  );
  score -= hesitationViolations.length * 5;

  // Penalize for very short answers (indicates uncertainty)
  const shortAnswers = answers.filter(a => a.answer.split(' ').length < 20);
  score -= shortAnswers.length * 3;

  // Penalize for looking away frequently
  const gazeViolations = violations.filter(v => v.type === 'LOOKING_AWAY');
  score -= gazeViolations.length * 2;

  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate Resume Claim Authenticity Score (0-100)
 */
const calculateResumeAuthenticityScore = async (questions, answers, resumeData) => {
  let totalScore = 0;
  let claimQuestions = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    if (question.resumeClaim) {
      claimQuestions++;
      const answer = answers.find(a => a.questionId === question.id);
      
      if (answer) {
        // Check if answer aligns with resume claim
        const evaluation = await evaluateWithAI(
          question.question,
          answer.answer,
          null,
          { checkResumeClaim: true, resumeClaim: question.resumeClaim }
        );
        totalScore += evaluation.score;
      } else {
        // No answer = low authenticity
        totalScore += 20;
      }
    }
  }

  return claimQuestions > 0 ? Math.round(totalScore / claimQuestions) : 100;
};

/**
 * Calculate Integrity Risk Score (0-100, lower is better)
 */
const calculateIntegrityRiskScore = (violations) => {
  let riskScore = 0;

  violations.forEach(violation => {
    switch (violation.severity) {
      case 'CRITICAL':
        riskScore += 15;
        break;
      case 'HIGH':
        riskScore += 10;
        break;
      case 'MEDIUM':
        riskScore += 5;
        break;
      case 'LOW':
        riskScore += 2;
        break;
    }
  });

  return Math.min(100, riskScore);
};

/**
 * Calculate Final Score using weighted formula
 * Formula: (Technical × 0.45) + (Problem Solving × 0.25) + 
 *          (Communication × 0.15) + (Resume Authenticity × 0.15) - 
 *          (Integrity Risk × 0.30)
 */
const calculateFinalScore = (scores) => {
  const finalScore = 
    (scores.technical * 0.45) +
    (scores.problemSolving * 0.25) +
    (scores.communication * 0.15) +
    (scores.resumeAuthenticity * 0.15) -
    (scores.integrityRisk * 0.30);

  return Math.max(0, Math.min(100, Math.round(finalScore)));
};

/**
 * Determine shortlist status based on scores and violations
 */
const determineShortlistStatus = (finalScore, integrityRiskScore, violations) => {
  // Check for critical violations
  const hasCriticalViolation = violations.some(v => v.severity === 'CRITICAL');

  // Auto-Shortlist criteria
  if (finalScore >= 70 && integrityRiskScore <= 20 && !hasCriticalViolation) {
    return 'SHORTLISTED';
  }

  // Auto-Reject criteria
  if (finalScore < 60 || integrityRiskScore > 35 || hasCriticalViolation) {
    return 'REJECTED';
  }

  // Manual Review
  return 'REVIEW';
};

/**
 * Get score breakdown for display
 */
export const getScoreBreakdown = async (sessionId) => {
  try {
    const result = await query(
      `SELECT * FROM scores WHERE session_id = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const scores = result.rows[0];

    return {
      technical: {
        score: scores.technical_score,
        weight: 0.45,
        contribution: scores.technical_score * 0.45
      },
      problemSolving: {
        score: scores.problem_solving_score,
        weight: 0.25,
        contribution: scores.problem_solving_score * 0.25
      },
      communication: {
        score: scores.communication_score,
        weight: 0.15,
        contribution: scores.communication_score * 0.15
      },
      resumeAuthenticity: {
        score: scores.resume_authenticity_score,
        weight: 0.15,
        contribution: scores.resume_authenticity_score * 0.15
      },
      integrityRisk: {
        score: scores.integrity_risk_score,
        weight: -0.30,
        contribution: -(scores.integrity_risk_score * 0.30)
      },
      final: scores.final_score,
      shortlistStatus: scores.shortlist_status
    };
  } catch (error) {
    console.error('Get score breakdown error:', error);
    throw error;
  }
};
