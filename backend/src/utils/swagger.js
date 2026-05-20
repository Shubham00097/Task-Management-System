import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scalable REST API with RBAC & Authentication',
      version: '1.0.0',
      description:
        'This is a secure, production-grade REST API project assignment designed for a Backend Developer Intern role. It features robust JWT Authentication, Role-Based Access Control (User vs Admin), CRUD operations on Tasks, Rate Limiting, Input Validation, and structured logs.',
      contact: {
        name: 'Backend Intern Candidate',
        email: 'intern@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your Bearer token in the format: JWT_TOKEN_VALUE',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Scan routes for Swagger JSDoc comments
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  // Mount the Swagger UI under /api/v1/api-docs
  app.use(
    '/api/v1/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }', // cleaner visual styling
      customSiteTitle: 'REST API Swagger Documentation',
    })
  );

  // Expose JSON endpoint
  app.get('/api/v1/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
