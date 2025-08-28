const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    // Create transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Email defaults
    this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@elearning.com';
    this.fromName = process.env.SMTP_FROM_NAME || 'E-Learning Platform';
  }

  /**
   * Send a welcome email to new user
   */
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to E-Learning Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to E-Learning Platform</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hello ${user.name}!</h2>
          <p>Thank you for joining our EU AI Act compliance training platform. We're excited to have you on board!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Getting Started:</h3>
            <ul style="margin: 10px 0;">
              <li>Browse available courses in your dashboard</li>
              <li>Track your progress and earn certificates</li>
              <li>Connect with your team and share insights</li>
            </ul>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>© 2024 E-Learning Platform. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send course enrollment notification
   */
  async sendCourseEnrollmentEmail(user, course) {
    const subject = `You've been enrolled in ${course.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Course Enrollment</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hello ${user.name}!</h2>
          <p>You have been successfully enrolled in:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">${course.title}</h3>
            <p>${course.description}</p>
            <p><strong>Duration:</strong> ${course.duration} hours</p>
            <p><strong>Modules:</strong> ${course.moduleCount}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/course/${course.id}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Learning
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send certificate earned email
   */
  async sendCertificateEmail(user, certificate) {
    const subject = `Congratulations! You've earned a certificate`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Certificate Earned!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Congratulations ${user.name}!</h2>
          <p>You have successfully completed the course and earned your certificate:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #10b981;">${certificate.courseTitle}</h3>
            <p><strong>Certificate ID:</strong> ${certificate.id}</p>
            <p><strong>Issued Date:</strong> ${new Date(certificate.issuedAt).toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${new Date(certificate.validUntil).toLocaleDateString()}</p>
          </div>
          
          <p>Your certificate demonstrates your expertise in EU AI Act compliance.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/certificates/${certificate.id}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Certificate
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send deadline reminder email
   */
  async sendDeadlineReminderEmail(user, course, deadline) {
    const subject = `Reminder: ${course.title} deadline approaching`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⏰ Deadline Reminder</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hello ${user.name}!</h2>
          <p>This is a reminder that you have an upcoming deadline:</p>
          
          <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #d97706;">${course.title}</h3>
            <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()} at ${new Date(deadline).toLocaleTimeString()}</p>
            <p><strong>Time Remaining:</strong> ${this.getTimeRemaining(deadline)}</p>
            <p><strong>Your Progress:</strong> ${course.progress}% complete</p>
          </div>
          
          <p>Make sure to complete the course before the deadline to earn your certificate.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/course/${course.id}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Continue Learning
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send team progress report email (for managers)
   */
  async sendTeamReportEmail(manager, reportData) {
    const subject = `Weekly Team Progress Report`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Team Progress Report</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hello ${manager.name}!</h2>
          <p>Here's your weekly team progress summary:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Team Statistics</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Total Team Members:</strong></td>
                <td style="text-align: right;">${reportData.totalMembers}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Active Learners:</strong></td>
                <td style="text-align: right;">${reportData.activeMembers}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Average Progress:</strong></td>
                <td style="text-align: right;">${reportData.averageProgress}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Certificates Earned:</strong></td>
                <td style="text-align: right;">${reportData.certificatesEarned}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Attention Required:</strong></p>
            <p style="margin: 5px 0;">${reportData.membersNeedingSupport} team members may need additional support</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/team" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Full Report
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(manager.email, subject, html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hello ${user.name}!</h2>
          <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Security Note:</strong></p>
            <p style="margin: 5px 0; color: #991b1b;">Never share your password with anyone. Our team will never ask for your password.</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send generic notification email
   */
  async sendNotificationEmail(user, notification) {
    const subject = notification.title;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">${notification.title}</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hello ${user.name}!</h2>
          <div style="margin: 20px 0;">
            ${notification.message}
          </div>
          
          ${notification.actionUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${notification.actionUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ${notification.actionText || 'View Details'}
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Core email sending method
   */
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }

  /**
   * Helper method to calculate time remaining
   */
  getTimeRemaining(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
}

// Export singleton instance
module.exports = new EmailService();