const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

// Import models
const Medication = require('./medication')(sequelize, DataTypes);
const DosageCalculation = require('./dosageCalculation')(sequelize, DataTypes);
const BarcodeMapping = require('./barcodeMapping')(sequelize, DataTypes);

// associations
Medication.hasMany(DosageCalculation, { foreignKey: 'medicationId' });
DosageCalculation.belongsTo(Medication, { foreignKey: 'medicationId' });

Medication.hasMany(BarcodeMapping, { foreignKey: 'medicationId' });
BarcodeMapping.belongsTo(Medication, { foreignKey: 'medicationId' });

module.exports = {
    sequelize,
    Medication,
    DosageCalculation,
    BarcodeMapping
};