const emailService = require('./email.service');
const { User } = require('../models');

class EmailQueueService {
  constructor() {
    // In production, you would use a proper queue like Bull or RabbitMQ
    // For now, we'll use a simple in-memory queue
    this.queue = [];
    this.processing = false;
    this.processInterval = null;
  }

  /**
   * Start processing the email queue
   */
  start() {
    if (this.processInterval) return;
    
    // Process queue every 5 seconds
    this.processInterval = setInterval(() => {
      this.processQueue();
    }, 5000);
    
    console.log('Email queue service started');
  }

  /**
   * Stop processing the email queue
   */
  stop() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
      console.log('Email queue service stopped');
    }
  }

  /**
   * Add email to queue
   */
  async addToQueue(emailType, data) {
    this.queue.push({
      id: Date.now() + Math.random(),
      type: emailType,
      data,
      attempts: 0,
      createdAt: new Date()
    });
    
    console.log(`Email added to queue: ${emailType}`);
  }

  /**
   * Process the email queue
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    try {
      // Process up to 10 emails at a time
      const batch = this.queue.splice(0, 10);
      
      for (const item of batch) {
        try {
          await this.sendEmail(item);
        } catch (error) {
          console.error(`Failed to send email ${item.id}:`, error);
          
          // Retry logic - add back to queue if attempts < 3
          if (item.attempts < 3) {
            item.attempts++;
            this.queue.push(item);
          } else {
            console.error(`Email ${item.id} failed after 3 attempts, discarding`);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Send individual email based on type
   */
  async sendEmail(item) {
    const { type, data } = item;
    
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(data.user);
        break;
        
      case 'enrollment':
        await emailService.sendCourseEnrollmentEmail(data.user, data.course);
        break;
        
      case 'certificate':
        await emailService.sendCertificateEmail(data.user, data.certificate);
        break;
        
      case 'deadline':
        await emailService.sendDeadlineReminderEmail(data.user, data.course, data.deadline);
        break;
        
      case 'team-report':
        await emailService.sendTeamReportEmail(data.manager, data.reportData);
        break;
        
      case 'password-reset':
        await emailService.sendPasswordResetEmail(data.user, data.resetToken);
        break;
        
      case 'notification':
        await emailService.sendNotificationEmail(data.user, data.notification);
        break;
        
      default:
        console.error(`Unknown email type: ${type}`);
    }
  }

  /**
   * Queue welcome emails for new users
   */
  async queueWelcomeEmail(userId) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await this.addToQueue('welcome', { user: user.toJSON() });
      }
    } catch (error) {
      console.error('Error queuing welcome email:', error);
    }
  }

  /**
   * Queue enrollment notification
   */
  async queueEnrollmentEmail(userId, courseData) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await this.addToQueue('enrollment', { 
          user: user.toJSON(), 
          course: courseData 
        });
      }
    } catch (error) {
      console.error('Error queuing enrollment email:', error);
    }
  }

  /**
   * Queue certificate email
   */
  async queueCertificateEmail(userId, certificateData) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await this.addToQueue('certificate', { 
          user: user.toJSON(), 
          certificate: certificateData 
        });
      }
    } catch (error) {
      console.error('Error queuing certificate email:', error);
    }
  }

  /**
   * Queue deadline reminder emails
   */
  async queueDeadlineReminders() {
    try {
      // This would typically be called by a cron job
      // Find all users with upcoming deadlines
      const upcomingDeadlines = await this.findUpcomingDeadlines();
      
      for (const item of upcomingDeadlines) {
        await this.addToQueue('deadline', {
          user: item.user,
          course: item.course,
          deadline: item.deadline
        });
      }
      
      console.log(`Queued ${upcomingDeadlines.length} deadline reminders`);
    } catch (error) {
      console.error('Error queuing deadline reminders:', error);
    }
  }

  /**
   * Queue team report emails for managers
   */
  async queueTeamReports() {
    try {
      // This would typically be called by a cron job
      // Find all managers and generate their reports
      const managers = await User.findAll({
        where: { role: ['manager', 'admin', 'super_admin'] }
      });
      
      for (const manager of managers) {
        const reportData = await this.generateTeamReport(manager.id);
        if (reportData) {
          await this.addToQueue('team-report', {
            manager: manager.toJSON(),
            reportData
          });
        }
      }
      
      console.log(`Queued ${managers.length} team reports`);
    } catch (error) {
      console.error('Error queuing team reports:', error);
    }
  }

  /**
   * Helper: Find upcoming deadlines (placeholder)
   */
  async findUpcomingDeadlines() {
    // This would query the database for upcoming deadlines
    // Returning empty array for now
    return [];
  }

  /**
   * Helper: Generate team report (placeholder)
   */
  async generateTeamReport(managerId) {
    // This would generate actual report data
    // Returning mock data for now
    return {
      totalMembers: 0,
      activeMembers: 0,
      averageProgress: 0,
      certificatesEarned: 0,
      membersNeedingSupport: 0
    };
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      running: !!this.processInterval
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.queue = [];
    console.log('Email queue cleared');
  }
}

// Export singleton instance
module.exports = new EmailQueueService();