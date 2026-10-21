const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'ToolShare API', version: '1.0.0', description: 'Tool/equipment reservation API' },
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
});
