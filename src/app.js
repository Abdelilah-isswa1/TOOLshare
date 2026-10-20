const express = require('express');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const swaggerSpec = require('./swagger');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use((req, res, next) => next(new AppError(404, 'not found')));
app.use(errorHandler);

module.exports = app;
