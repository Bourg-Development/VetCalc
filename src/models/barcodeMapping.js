module.exports = (sequelize, DataTypes) => {
    return sequelize.define('BarcodeMapping', {
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
        barcode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        barcodeType: {
            type: DataTypes.ENUM('EAN-13', 'UPC', 'Code128', 'DataMatrix'),
            allowNull: false,
            defaultValue: 'EAN-13'
        },
        pzn: {
            type: DataTypes.STRING,
            comment: 'Pharmazentralnummer'
        },
        packageSize: {
            type: DataTypes.STRING
        },
        batchNumber: {
            type: DataTypes.STRING
        },
        expiryDate: {
            type: DataTypes.DATE
        }
    });
};