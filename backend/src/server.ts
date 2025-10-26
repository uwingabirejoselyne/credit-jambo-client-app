import app from './app';
import { envConfig } from './config/env.config';
import { databaseConnection } from './config/database.config';

class Server {
  private port: number;

  constructor() {
    this.port = envConfig.PORT;
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      console.log('Connecting to database...');
      await databaseConnection.connect();

      // Start server
      app.listen(this.port, () => {
        console.log('='.repeat(50));
        console.log(`🚀 Credit Jambo Client API Server`);
        console.log(`=`.repeat(50));
        console.log(`Environment: ${envConfig.NODE_ENV}`);
        console.log(`Server running on port: ${this.port}`);
        console.log(`API Version: ${envConfig.API_VERSION}`);
        console.log(`Base URL: http://localhost:${this.port}/api/${envConfig.API_VERSION}`);
        console.log(`Health Check: http://localhost:${this.port}/health`);
        console.log('='.repeat(50));
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason: Error) => {
        console.error('Unhandled Rejection:', reason);
        this.shutdown();
      });

      // Handle uncaught exceptions
      process.on('uncaughtException', (error: Error) => {
        console.error('Uncaught Exception:', error);
        this.shutdown();
      });

      // Handle SIGTERM
      process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        this.shutdown();
      });

      // Handle SIGINT (Ctrl+C)
      process.on('SIGINT', () => {
        console.log('\nSIGINT received, shutting down gracefully...');
        this.shutdown();
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    try {
      console.log('Closing database connection...');
      await databaseConnection.disconnect();
      console.log('Server shut down successfully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();
