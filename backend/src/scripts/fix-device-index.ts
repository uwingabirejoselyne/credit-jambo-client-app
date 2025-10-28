import mongoose from 'mongoose';
import { envConfig } from '../config/env.config';
import { Customer } from '../models/customer.model';

/**
 * Script to drop the unique index on deviceIdHash
 * This allows multiple customers to use the same device
 */

async function fixDeviceIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(envConfig.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the collection
    const collection = Customer.collection;

    // List all indexes
    const indexes = await collection.indexes();
    console.log('\nCurrent indexes:');
    indexes.forEach((index) => {
      console.log(`- ${index.name}:`, index.key);
    });

    // Drop the unique index on devices.deviceIdHash if it exists
    try {
      await collection.dropIndex('devices.deviceIdHash_1');
      console.log('\n✓ Successfully dropped unique index on devices.deviceIdHash');
    } catch (error: any) {
      if (error.codeName === 'IndexNotFound') {
        console.log('\n- Index devices.deviceIdHash_1 not found (already removed)');
      } else {
        throw error;
      }
    }

    // List indexes after dropping
    const newIndexes = await collection.indexes();
    console.log('\nIndexes after fix:');
    newIndexes.forEach((index) => {
      console.log(`- ${index.name}:`, index.key);
    });

    console.log('\n✓ Fix completed successfully!');
  } catch (error) {
    console.error('Error fixing device index:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixDeviceIndex();
