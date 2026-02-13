/**
 * Email Service
 * Handles sending emails to candidates and recruiters
 */

import nodemailer from 'nodemailer';

// Create transporter based on environment
const createTransporter = () => {
  // For development, use Gmail or a test account
  // For production, use a proper email service (SendGrid, AWS SES, etc.)
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    console.log('✅ Email service configured: Gmail');
    console.log('📧 Using email:', process.env.EMAIL_USER);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password, not regular password
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'smtp') {
    console.log('✅ Email service configured: SMTP');
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    // Development mode - use Ethereal (fake SMTP for testing)
    console.log('⚠️  Email service not configured. Using test mode.');
    console.log('📧 Emails will be logged to console instead of being sent.');
    return null;
  }
};

const transporter = createTransporter();

/**
 * Send interview invitation email to candidate
 */
export const sendInterviewInvitation = async (candidateEmail, candidateName, interviewLink, recruiterName, companyName = 'INTERVUEX') => {
  try {
    const emailContent = {
      from: process.env.EMAIL_FROM || '"INTERVUEX" <noreply@intervuex.com>',
      to: candidateEmail,
      subject: `Interview Invitation from ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #5568d3; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Interview Invitation</h1>
              <p>You've been invited to complete an AI-powered interview</p>
            </div>
            
            <div class="content">
              <p>Dear ${candidateName},</p>
              
              <p>Congratulations! ${recruiterName} from <strong>${companyName}</strong> has invited you to participate in an AI-powered interview assessment.</p>
              
              <div class="info-box">
                <h3>📋 Interview Details</h3>
                <ul>
                  <li><strong>Duration:</strong> 30 minutes</li>
                  <li><strong>Format:</strong> AI-powered adaptive questions</li>
                  <li><strong>Features:</strong> Voice recording & text answers supported</li>
                  <li><strong>Proctoring:</strong> Camera and microphone monitoring enabled</li>
                </ul>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Instructions:</strong>
                <ul>
                  <li>Find a quiet, well-lit room</li>
                  <li>Ensure stable internet connection</li>
                  <li>Allow camera and microphone access</li>
                  <li>Complete the interview in one sitting (cannot pause)</li>
                  <li>This link expires in 24 hours</li>
                </ul>
              </div>
              
              <center>
                <a href="${interviewLink}" class="button">Start Interview Now</a>
              </center>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Or copy this link: <br>
                <code style="background: #e9ecef; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-top: 5px;">${interviewLink}</code>
              </p>
              
              <div class="info-box" style="margin-top: 30px;">
                <h3>💡 Tips for Success</h3>
                <ul>
                  <li>Speak clearly if using voice recording</li>
                  <li>Provide detailed, structured answers</li>
                  <li>Include examples and code snippets when relevant</li>
                  <li>Stay focused and avoid distractions</li>
                  <li>Questions adapt to your answers - do your best!</li>
                </ul>
              </div>
              
              <p>Good luck with your interview! We look forward to reviewing your responses.</p>
              
              <p>Best regards,<br>
              <strong>${recruiterName}</strong><br>
              ${companyName}</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email from INTERVUEX AI Interview Platform</p>
              <p>If you have questions, please contact ${recruiterName} directly</p>
              <p>&copy; 2026 INTERVUEX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Interview Invitation from ${companyName}

Dear ${candidateName},

Congratulations! ${recruiterName} from ${companyName} has invited you to participate in an AI-powered interview assessment.

Interview Details:
- Duration: 30 minutes
- Format: AI-powered adaptive questions
- Features: Voice recording & text answers supported
- Proctoring: Camera and microphone monitoring enabled

Important Instructions:
- Find a quiet, well-lit room
- Ensure stable internet connection
- Allow camera and microphone access
- Complete the interview in one sitting (cannot pause)
- This link expires in 24 hours

Start your interview here:
${interviewLink}

Tips for Success:
- Speak clearly if using voice recording
- Provide detailed, structured answers
- Include examples and code snippets when relevant
- Stay focused and avoid distractions
- Questions adapt to your answers - do your best!

Good luck with your interview!

Best regards,
${recruiterName}
${companyName}

---
This is an automated email from INTERVUEX AI Interview Platform
© 2026 INTERVUEX. All rights reserved.
      `
    };

    if (!transporter) {
      // Development mode - log email instead of sending
      console.log('\n📧 ===== EMAIL WOULD BE SENT =====');
      console.log('To:', candidateEmail);
      console.log('Subject:', emailContent.subject);
      console.log('Interview Link:', interviewLink);
      console.log('================================\n');
      return { success: true, mode: 'test', message: 'Email logged (test mode)' };
    }

    const info = await transporter.sendMail(emailContent);
    console.log('✅ Email sent successfully:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId,
      mode: 'production',
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

/**
 * Send interview completion notification to recruiter
 */
export const sendInterviewCompletionNotification = async (recruiterEmail, recruiterName, candidateName, sessionId) => {
  try {
    const reportLink = `${process.env.FRONTEND_URL}/interview-report/${sessionId}`;
    
    const emailContent = {
      from: process.env.EMAIL_FROM || '"INTERVUEX" <noreply@intervuex.com>',
      to: recruiterEmail,
      subject: `Interview Completed - ${candidateName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Interview Completed</h1>
              <p>A candidate has completed their interview</p>
            </div>
            
            <div class="content">
              <p>Dear ${recruiterName},</p>
              
              <p><strong>${candidateName}</strong> has successfully completed their interview assessment.</p>
              
              <div class="info-box">
                <h3>📊 Next Steps</h3>
                <ul>
                  <li>Review the candidate's responses</li>
                  <li>Check AI-generated scores and analysis</li>
                  <li>Review proctoring violations (if any)</li>
                  <li>Make your hiring decision</li>
                </ul>
              </div>
              
              <center>
                <a href="${reportLink}" class="button">View Interview Report</a>
              </center>
              
              <p>The report includes detailed answers, AI scoring, and integrity analysis.</p>
              
              <p>Best regards,<br>
              <strong>INTERVUEX Team</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from INTERVUEX</p>
              <p>&copy; 2026 INTERVUEX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Interview Completed - ${candidateName}

Dear ${recruiterName},

${candidateName} has successfully completed their interview assessment.

Next Steps:
- Review the candidate's responses
- Check AI-generated scores and analysis
- Review proctoring violations (if any)
- Make your hiring decision

View the full report here:
${reportLink}

Best regards,
INTERVUEX Team
      `
    };

    if (!transporter) {
      console.log('\n📧 ===== COMPLETION EMAIL WOULD BE SENT =====');
      console.log('To:', recruiterEmail);
      console.log('Subject:', emailContent.subject);
      console.log('Report Link:', reportLink);
      console.log('==========================================\n');
      return { success: true, mode: 'test' };
    }

    const info = await transporter.sendMail(emailContent);
    console.log('✅ Completion email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId, mode: 'production' };

  } catch (error) {
    console.error('❌ Completion email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send test email to verify configuration
 */
export const sendTestEmail = async (toEmail) => {
  try {
    const emailContent = {
      from: process.env.EMAIL_FROM || '"INTERVUEX" <noreply@intervuex.com>',
      to: toEmail,
      subject: 'INTERVUEX Email Configuration Test',
      html: `
        <h2>✅ Email Configuration Successful!</h2>
        <p>Your INTERVUEX email service is configured correctly.</p>
        <p>You can now send interview invitations automatically.</p>
      `,
      text: 'Email configuration test successful! Your INTERVUEX email service is working.'
    };

    if (!transporter) {
      console.log('📧 Test email would be sent to:', toEmail);
      return { success: true, mode: 'test' };
    }

    const info = await transporter.sendMail(emailContent);
    return { success: true, messageId: info.messageId, mode: 'production' };

  } catch (error) {
    console.error('Test email error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendInterviewInvitation,
  sendInterviewCompletionNotification,
  sendTestEmail
};
