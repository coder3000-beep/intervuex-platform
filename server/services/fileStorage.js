/**
 * File Storage Service
 * Handles file uploads and storage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB

// Ensure upload directory exists
const uploadsPath = path.join(__dirname, '..', '..', UPLOAD_DIR);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/**
 * Save file to storage
 */
export const saveFile = async (fileBuffer, filename) => {
  try {
    const filePath = path.join(uploadsPath, filename);
    fs.writeFileSync(filePath, fileBuffer);
    return {
      success: true,
      path: filePath,
      url: `/uploads/${filename}`
    };
  } catch (error) {
    console.error('Save file error:', error);
    throw new Error('Failed to save file');
  }
};

/**
 * Save screenshot
 */
export const saveScreenshot = async (base64Data, sessionId) => {
  try {
    const timestamp = Date.now();
    const filename = `screenshot_${sessionId}_${timestamp}.png`;
    
    // Remove data:image/png;base64, prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    const filePath = path.join(uploadsPath, 'screenshots', filename);
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(uploadsPath, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, buffer);
    
    return {
      success: true,
      path: filePath,
      url: `/uploads/screenshots/${filename}`
    };
  } catch (error) {
    console.error('Save screenshot error:', error);
    throw new Error('Failed to save screenshot');
  }
};

/**
 * Upload to S3 (or local storage as fallback)
 */
export const uploadToS3 = async (base64Data, key) => {
  try {
    // For now, save locally (can be extended to use AWS S3)
    const filename = key.split('/').pop();
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    const filePath = path.join(uploadsPath, filename);
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Upload to S3 error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete file
 */
export const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Delete file error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get file
 */
export const getFile = async (filename) => {
  try {
    const filePath = path.join(uploadsPath, filename);
    if (fs.existsSync(filePath)) {
      return {
        success: true,
        path: filePath,
        buffer: fs.readFileSync(filePath)
      };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Get file error:', error);
    throw new Error('Failed to get file');
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (fileSize) => {
  return fileSize <= MAX_FILE_SIZE;
};

/**
 * Validate file type
 */
export const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};
