
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Import routes
const apiRoutes = require('./routes/apiRoutes');
// Create Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // CSP deaktivieren
}));
// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(expressLayouts);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.set('view engine', 'ejs');
app.set('layout', 'layouts/default');
app.set('views', path.join(__dirname, 'views'))

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// API Routes
app.use('/api', apiRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Dashboard Route (SPA fallback)
app.get('/', (req, res) => {
    res.render('pages/dashboard.ejs')
});


// Dashboard Route (SPA fallback)
app.get('/medications', (req, res) => {
    res.render('pages/medications.ejs')
});

// 404 handler for unknown routes
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API-Endpoint nicht gefunden' });
    } else {
        // For non-API routes, serve the main app (SPA routing)
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Validierungsfehler',
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'Daten bereits vorhanden',
            field: err.errors[0]?.path
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Ungültiger Token' });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Ein Fehler ist aufgetreten'
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;