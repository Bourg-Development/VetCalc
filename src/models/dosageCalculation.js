module.exports = (sequelize, DataTypes) => {
    return sequelize.define('DosageCalculation', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        medicationId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Medications',
                key: 'id'
            }
        },
        patientWeight: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },
        patientAge: {
            type: DataTypes.INTEGER
        },
        indication: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dosagePerKg: {
            type: DataTypes.DECIMAL(8, 4),
            allowNull: false
        },
        maxDailyDose: {
            type: DataTypes.DECIMAL(8, 4)
        },
        frequency: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        calculatedDose: {
            type: DataTypes.DECIMAL(8, 4),
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'mg'
        },
        calculatedBy: {
            type: DataTypes.STRING
        },
        notes: {
            type: DataTypes.TEXT
        }
    });
};