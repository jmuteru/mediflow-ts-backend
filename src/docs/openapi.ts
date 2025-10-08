import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'MediHeal API',
    version: '1.0.0',
    description: 'Backend API service for healthcare/medical application'
  },
  servers: [
    { url: '/api', description: 'API Base' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    { bearerAuth: [] }
  ]
};

export const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition as any,
  apis: [
    'src/routes/**/*.ts',
    'src/controllers/**/*.ts',
  ]
});


