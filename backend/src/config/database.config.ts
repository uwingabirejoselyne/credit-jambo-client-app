import mongoose from 'mongoose';
import { envConfig } from './env.config';
import { Session } from '../models/session.model'; // ✅ Import your Session model

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log(' Database already connected');
      return;
    }

    try {
      const uri = envConfig.isTest ? envConfig.MONGODB_URI_TEST : envConfig.MONGODB_URI;

      const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        autoIndex: envConfig.isDevelopment, // ✅ Automatically create indexes in dev
      };

      await mongoose.connect(uri, options);
      this.isConnected = true;

      console.log(` MongoDB connected successfully to: ${envConfig.isTest ? 'TEST DB' : 'MAIN DB'}`);

      /**
       * ✅ Fix: Handle stale index "sessionId_1"
       * This prevents "E11000 duplicate key error: sessionId_1 dup key: { sessionId: null }"
       */
      try {
        const indexes = await Session.collection.indexes();
        const hasOldIndex = indexes.some((idx) => idx.name === 'sessionId_1');
        if (hasOldIndex) {
          console.warn(' Found old index sessionId_1 — dropping it...');
          await Session.collection.dropIndex('sessionId_1');
          console.log(' Old sessionId_1 index removed');
        }

        //  Ensure current schema indexes are up to date
        await Session.syncIndexes();
        console.log('Session indexes synced successfully');
      } catch (indexError) {
        console.error('Failed to sync Session indexes:', indexError);
      }

      // ----------------- Connection Events -----------------
      mongoose.connection.on('error', (error) => {
        console.error(' MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn(' MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error(' Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error(' Error closing MongoDB connection:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const databaseConnection = DatabaseConnection.getInstance();
