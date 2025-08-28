const emailService = require('../../services/email.service');
const emailQueueService = require('../../services/emailQueue.service');
const { User } = require('../../models');

// Test email connection
const testConnection = async (req, res) => {
  try {
    const isConnected = await emailService.verifyConnection();
    
    res.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Email service is connected' : 'Email service connection failed'
    });
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test email connection'
    });
  }
};

// Send test email
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body || {};
    const testEmail = email || req.user.email;
    
    const result = await emailService.sendEmail(
      testEmail,
      'Test Email from E-Learning Platform',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email from the E-Learning Platform.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    );
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
};

// Get email queue status
const getQueueStatus = async (req, res) => {
  try {
    const status = emailQueueService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status'
    });
  }
};

// Clear email queue (Admin only)
const clearQueue = async (req, res) => {
  try {
    emailQueueService.clearQueue();
    
    res.json({
      success: true,
      message: 'Email queue cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear email queue'
    });
  }
};

// Trigger welcome email for a user (Admin only)
const sendWelcomeEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await emailQueueService.queueWelcomeEmail(userId);
    
    res.json({
      success: true,
      message: 'Welcome email queued successfully'
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue welcome email'
    });
  }
};

// Trigger certificate email
const sendCertificateEmail = async (req, res) => {
  try {
    const { userId, certificateId } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mock certificate data for now
    const certificateData = {
      id: certificateId,
      courseTitle: 'EU AI Act Fundamentals',
      issuedAt: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };
    
    await emailQueueService.queueCertificateEmail(userId, certificateData);
    
    res.json({
      success: true,
      message: 'Certificate email queued successfully'
    });
  } catch (error) {
    console.error('Error sending certificate email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue certificate email'
    });
  }
};

// Trigger deadline reminders (Admin only)
const sendDeadlineReminders = async (req, res) => {
  try {
    await emailQueueService.queueDeadlineReminders();
    
    res.json({
      success: true,
      message: 'Deadline reminders queued successfully'
    });
  } catch (error) {
    console.error('Error sending deadline reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue deadline reminders'
    });
  }
};

// Trigger team reports (Admin only)
const sendTeamReports = async (req, res) => {
  try {
    await emailQueueService.queueTeamReports();
    
    res.json({
      success: true,
      message: 'Team reports queued successfully'
    });
  } catch (error) {
    console.error('Error sending team reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue team reports'
    });
  }
};

module.exports = {
  testConnection,
  sendTestEmail,
  getQueueStatus,
  clearQueue,
  sendWelcomeEmail,
  sendCertificateEmail,
  sendDeadlineReminders,
  sendTeamReports
};