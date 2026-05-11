const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NotIntoTech API Documentation',
            version: '1.0.0',
            description: 'API documentation for NotIntoTech website',
        },
        servers: [
            {
                url: '/',
                description: 'Current Environment'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerSetup = (app) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "NotIntoTech API Docs"
    }));
};

module.exports = swaggerSetup;