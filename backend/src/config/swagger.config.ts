import swaggerJsdoc from 'swagger-jsdoc';
import { envConfig } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Credit Jambo Client API',
      version: '1.0.0',
      description: 'API documentation for Credit Jambo Client Application - Savings Management System',
    },
    servers: [
      {
        url: `${envConfig.BASE_URL}/api`,
        description: 'Production server',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // files containing OpenAPI definitions
};

export const specs = swaggerJsdoc(options);