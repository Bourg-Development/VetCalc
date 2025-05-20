const { sequelize } = require('../src/models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Datenbankverbindung erfolgreich');

        await sequelize.sync({ force: false });
        console.log('Datenbank erfolgreich synchronisiert');

        process.exit(0);
    } catch (error) {
        console.error('Migration fehlgeschlagen:', error);
        process.exit(1);
    }
}

migrate();
