const app = require('./app');
const { sequelize } = require('./models');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Database connection and sync
async function connectDatabase() {
    try {
        // Test the connection
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Verbindung erfolgreich hergestellt');

        // Sync database (create tables if they don't exist)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: false });
            console.log('✅ Datenbank-Tabellen synchronisiert');
        }

        return true;
    } catch (error) {
        console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
        return false;
    }
}

// Server startup
async function startServer() {
    try {
        // Connect to database first
        const dbConnected = await connectDatabase();

        if (!dbConnected) {
            console.error('❌ Server konnte nicht gestartet werden: Datenbankverbindung fehlgeschlagen');
            process.exit(1);
        }

        // Start the server
        const server = app.listen(PORT, HOST, () => {
            console.log(`🚀 Server läuft auf http://${HOST}:${PORT}`);
            console.log(`📋 Dashboard: http://${HOST}:${PORT}`);
            console.log(`🔗 API: http://${HOST}:${PORT}/api`);
            console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM erhalten, Server wird heruntergefahren...');
            gracefulShutdown(server);
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT erhalten, Server wird heruntergefahren...');
            gracefulShutdown(server);
        });

        return server;
    } catch (error) {
        console.error('❌ Fehler beim Starten des Servers:', error);
        process.exit(1);
    }
}

// Graceful shutdown function
async function gracefulShutdown(server) {
    console.log('🔄 Graceful shutdown gestartet...');

    // Stop accepting new connections
    server.close(async () => {
        console.log('✅ HTTP Server geschlossen');

        try {
            // Close database connection
            await sequelize.close();
            console.log('✅ Datenbankverbindung geschlossen');

            console.log('✅ Graceful shutdown abgeschlossen');
            process.exit(0);
        } catch (error) {
            console.error('❌ Fehler beim Graceful shutdown:', error);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Graceful shutdown dauerte zu lange, Force shutdown...');
        process.exit(1);
    }, 10000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };