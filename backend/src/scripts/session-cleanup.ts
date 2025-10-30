import mongoose from 'mongoose';
import { Session } from '../models/session.model';
import { envConfig } from '../config/env.config';

/**
 * Script to cleanup expired and inactive sessions
 * This should be run periodically to maintain database performance
 */

async function cleanupSessions() {
  try {
    console.log('Starting session cleanup...');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(envConfig.MONGODB_URI);
      console.log('Connected to MongoDB');
    }
    
    // Cleanup expired sessions
    const result1 = await Session.cleanupExpired();
    console.log(`Cleaned up ${result1.deletedCount} expired sessions`);
    
    // Cleanup inactive sessions older than 30 days
    const result2 = await Session.cleanupInactiveSessions();
    console.log(`Cleaned up ${result2.deletedCount} inactive sessions older than 30 days`);
    
    console.log('Session cleanup completed successfully');
  } catch (error) {
    console.error('Error during session cleanup:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupSessions();
}

export { cleanupSessions };