module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Medication', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        activeIngredient: {
            type: DataTypes.STRING,
            allowNull: false
        },
        strength: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dosageAmount: {
            type: DataTypes.DECIMAL(10, 3),
            allowNull: true,
            validate: {
                min: 0
            }
        },
        dosageUnit: {
            type: DataTypes.ENUM('mg', 'g', 'mcg', 'pg', 'ml', 'l', 'IU', 'Stk', 'Tropfen', 'Hub', 'Beutel', '%'),
            allowNull: true
        },
        dosageDisplay: {
            type: DataTypes.VIRTUAL,
            get() {
                if (this.dosageAmount && this.dosageUnit) {
                    return `${this.dosageAmount} ${this.dosageUnit}`;
                }
                return this.strength; // Fallback
            }
        },
        dosageInstructions: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isArrayOfStrings(value) {
                    if (!Array.isArray(value)) {
                        throw new Error('Dosage instructions have to be of type: array');
                    }
                    if (value.some(item => typeof item !== 'string')) {
                        throw new Error('All contents of dosage instructions array have to be of type string');
                    }
                }
            }
        },

        category: {
            type: DataTypes.ENUM('Anästhetika', 'Antibiotika', 'Antiparasitika', 'Augensalbe', 'Bronchienerweiterer', 'Ergenzungsfuttermittel','Salbe', 'Schleimlöser','Schmerzmittel', 'Impfstoffe', 'Hormone', 'Vitamine', 'Sonstige'),
            allowNull: false,
            defaultValue: 'Sonstige'
        },
        form: {
            type: DataTypes.ENUM('Tablette', 'Kapsel', 'Tropfen', 'Sirup', 'Injektion', 'Salbe', 'Spray'),
            allowNull: true
        },
        manufacturer: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        sideEffects: {
            type: DataTypes.TEXT
        },
        contraindications: {
            type: DataTypes.TEXT
        },
        interactions: {
            type: DataTypes.TEXT
        },
        storage: {
            type: DataTypes.STRING
        },
        prescriptionRequired: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
};