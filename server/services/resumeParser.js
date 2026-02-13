/**
 * Resume Parser Service
 * Extracts structured data from PDF/DOC resumes
 */

import pdfParse from 'pdf-parse';
import natural from 'natural';
import fs from 'fs';

const tokenizer = new natural.WordTokenizer();

/**
 * Parse resume file and extract structured data
 */
export const parseResume = async (file) => {
  try {
    // Handle multer file object
    const filePath = file.path || file;
    
    // Read file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Extract structured information
    const parsed = {
      rawText: text,
      email: extractEmail(text),
      phone: extractPhone(text),
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      projects: extractProjects(text)
    };

    return {
      fileUrl: filePath,
      parsed,
      skills: parsed.skills
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    // Return empty data instead of throwing
    return {
      fileUrl: null,
      parsed: {},
      skills: []
    };
  }
};

/**
 * Extract email from text
 */
const extractEmail = (text) => {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : null;
};

/**
 * Extract phone number from text
 */
const extractPhone = (text) => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : null;
};

/**
 * Extract skills from text
 */
const extractSkills = (text) => {
  const commonSkills = [
    // Programming Languages
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'TypeScript',
    
    // Web Technologies
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
    'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
    
    // Databases
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform',
    
    // Tools & Frameworks
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum', 'REST API', 'GraphQL',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'AI',
    
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android',
    
    // Other
    'Microservices', 'System Design', 'Testing', 'Jest', 'Mocha', 'Selenium'
  ];

  const foundSkills = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

/**
 * Extract work experience from text
 */
const extractExperience = (text) => {
  const experienceSection = extractSection(text, ['experience', 'work history', 'employment']);
  
  if (!experienceSection) return [];

  // Extract years of experience
  const yearRegex = /(\d+)\+?\s*(years?|yrs?)/gi;
  const matches = experienceSection.match(yearRegex);
  
  return experienceSection.substring(0, 500); // Return first 500 chars
};

/**
 * Extract education from text
 */
const extractEducation = (text) => {
  const educationSection = extractSection(text, ['education', 'academic', 'qualification']);
  
  if (!educationSection) return [];

  const degrees = ['B.Tech', 'B.E', 'M.Tech', 'M.E', 'MBA', 'MCA', 'BCA', 'B.Sc', 'M.Sc', 'PhD'];
  const foundDegrees = [];

  degrees.forEach(degree => {
    if (educationSection.includes(degree)) {
      foundDegrees.push(degree);
    }
  });

  return educationSection.substring(0, 300);
};

/**
 * Extract projects from text
 */
const extractProjects = (text) => {
  const projectSection = extractSection(text, ['projects', 'portfolio', 'work samples']);
  
  if (!projectSection) return [];

  return projectSection.substring(0, 500);
};

/**
 * Extract section from text based on headers
 */
const extractSection = (text, headers) => {
  const lines = text.split('\n');
  let startIndex = -1;
  let endIndex = lines.length;

  // Find section start
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (headers.some(header => line.includes(header))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return null;

  // Find section end (next major header)
  const majorHeaders = ['experience', 'education', 'skills', 'projects', 'certifications'];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (majorHeaders.some(header => line.includes(header) && !headers.includes(header))) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join('\n');
};

/**
 * Analyze resume quality
 */
export const analyzeResumeQuality = (parsedData) => {
  let score = 0;

  // Check completeness
  if (parsedData.email) score += 10;
  if (parsedData.phone) score += 10;
  if (parsedData.skills.length > 0) score += 20;
  if (parsedData.experience) score += 30;
  if (parsedData.education) score += 20;
  if (parsedData.projects) score += 10;

  return {
    score,
    completeness: score >= 80 ? 'Good' : score >= 50 ? 'Fair' : 'Poor',
    suggestions: generateSuggestions(parsedData)
  };
};

/**
 * Generate suggestions for resume improvement
 */
const generateSuggestions = (parsedData) => {
  const suggestions = [];

  if (!parsedData.email) suggestions.push('Add email address');
  if (!parsedData.phone) suggestions.push('Add phone number');
  if (parsedData.skills.length < 5) suggestions.push('Add more relevant skills');
  if (!parsedData.experience) suggestions.push('Add work experience');
  if (!parsedData.projects) suggestions.push('Add project details');

  return suggestions;
};
