import cron from 'node-cron';
import { Session } from '../models/session.model';

/**
 * Job Service for handling scheduled tasks
 */

export class JobService {
  private static isInitialized = false;

  /**
   * Initialize all scheduled jobs
   */
  static async initialize() {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing scheduled jobs...');
    
    // Cleanup expired and inactive sessions every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled session cleanup...');
      try {
        const result1 = await Session.cleanupExpired();
        const result2 = await Session.cleanupInactiveSessions();
        
        console.log(`Scheduled cleanup completed: ${result1.deletedCount} expired sessions, ${result2.deletedCount} old inactive sessions removed`);
      } catch (error) {
        console.error('Error during scheduled session cleanup:', error);
      }
    });
    
    // More thorough cleanup once a day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily thorough session cleanup...');
      try {
        const result1 = await Session.deleteMany({
          expiresAt: { $lt: new Date() }
        });
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result2 = await Session.deleteMany({
          isActive: false,
          updatedAt: { $lt: thirtyDaysAgo }
        });
        
        console.log(`Daily cleanup completed: ${result1.deletedCount} expired sessions, ${result2.deletedCount} old inactive sessions removed`);
      } catch (error) {
        console.error('Error during daily session cleanup:', error);
      }
    });

    this.isInitialized = true;
    console.log('Scheduled jobs initialized successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  static async stop() {
    console.log('Stopping scheduled jobs...');
    cron.getTasks().forEach(task => task.stop());
    this.isInitialized = false;
  }
}