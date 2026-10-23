const express = require('express');
const routes = require('./routes');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);


module.exports = app;