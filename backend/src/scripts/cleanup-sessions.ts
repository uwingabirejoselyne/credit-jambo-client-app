import mongoose from 'mongoose';
import { envConfig } from '../config/env.config';
import { Session } from '../models/session.model';

/**
 * Script to cleanup all sessions
 * This will remove all existing sessions to fix any duplicate token issues
 */

async function cleanupSessions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(envConfig.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count sessions before cleanup
    const beforeCount = await Session.countDocuments();
    console.log(`\nFound ${beforeCount} sessions`);

    // Delete all sessions
    const result = await Session.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} sessions`);

    // Verify cleanup
    const afterCount = await Session.countDocuments();
    console.log(`Sessions remaining: ${afterCount}`);

    console.log('\n✓ Cleanup completed successfully!');
    console.log('Users will need to login again.');
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
cleanupSessions();
