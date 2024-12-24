const cors = require('cors');

cds.on('bootstrap', (app) => {
    app.use(cors({
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
});

module.exports = cds.server;