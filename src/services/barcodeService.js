const { BarcodeMapping, Medication } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');


class BarcodeService {
    async scanBarcode(barcode) {
        const barcodeMapping = await BarcodeMapping.findOne({
            where: { barcode },
            include: [Medication]
        });

        if (!barcodeMapping) {
            console.log(2)
            throw new Error('Barcode nicht gefunden');
        }

        return {
            barcode: barcodeMapping,
            medication: barcodeMapping.Medication,
            scanTime: new Date().toISOString()
        };
    }

    async createBarcodeMapping(barcodeData) {
        // Validate medication exists
        const medication = await Medication.findByPk(barcodeData.medicationId);
        if (!medication) {
            throw new Error('Medikament nicht gefunden');
        }

        // Check if barcode already exists
        const existingBarcode = await BarcodeMapping.findOne({
            where: { barcode: barcodeData.barcode }
        });

        if (existingBarcode) {
            throw new Error('Barcode bereits vorhanden');
        }

        const barcodeMapping = await BarcodeMapping.create(barcodeData);

        // Return with medication information
        return await BarcodeMapping.findByPk(barcodeMapping.id, {
            include: [Medication]
        });
    }

    async getBarcodesByMedication(medicationId) {
        const barcodes = await BarcodeMapping.findAll({
            where: { medicationId },
            include: [Medication],
            order: [['createdAt', 'DESC']]
        });

        return barcodes;
    }

    async getBarcodeById(id) {
        const barcode = await BarcodeMapping.findByPk(id, {
            include: [Medication]
        });

        if (!barcode) {
            throw new Error('Barcode-Mapping nicht gefunden');
        }

        return barcode;
    }

    async updateBarcodeMapping(id, barcodeData) {
        const barcodeMapping = await BarcodeMapping.findByPk(id);

        if (!barcodeMapping) {
            throw new Error('Barcode-Mapping nicht gefunden');
        }

        // If medicationId is being updated, validate it exists
        if (barcodeData.medicationId && barcodeData.medicationId !== barcodeMapping.medicationId) {
            const medication = await Medication.findByPk(barcodeData.medicationId);
            if (!medication) {
                throw new Error('Medikament nicht gefunden');
            }
        }

        // If barcode is being updated, check for duplicates
        if (barcodeData.barcode && barcodeData.barcode !== barcodeMapping.barcode) {
            const existingBarcode = await BarcodeMapping.findOne({
                where: {
                    barcode: barcodeData.barcode,
                    id: { [Op.ne]: id }
                }
            });

            if (existingBarcode) {
                throw new Error('Barcode bereits vorhanden');
            }
        }

        await barcodeMapping.update(barcodeData);

        // Return updated mapping with medication
        return await BarcodeMapping.findByPk(id, {
            include: [Medication]
        });
    }

    async deleteBarcodeMapping(id) {
        const barcodeMapping = await BarcodeMapping.findByPk(id);

        if (!barcodeMapping) {
            throw new Error('Barcode-Mapping nicht gefunden');
        }

        await barcodeMapping.destroy();
        return { message: 'Barcode-Mapping gelöscht' };
    }

    async getAllBarcodeMappings(options = {}) {
        const { page = 1, limit = 10, medicationId, barcodeType } = options;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (medicationId) {
            whereClause.medicationId = medicationId;
        }
        if (barcodeType) {
            whereClause.barcodeType = barcodeType;
        }

        const barcodeMappings = await BarcodeMapping.findAndCountAll({
            where: whereClause,
            include: [Medication],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            barcodeMappings: barcodeMappings.rows,
            totalCount: barcodeMappings.count,
            totalPages: Math.ceil(barcodeMappings.count / limit),
            currentPage: parseInt(page)
        };
    }

    async getBarcodeStatistics() {
        const totalBarcodes = await BarcodeMapping.count();

        const typeStats = await BarcodeMapping.findAll({
            attributes: [
                'barcodeType',
                [sequelize.fn('COUNT', sequelize.col('barcodeType')), 'count']
            ],
            group: 'barcodeType',
            order: [[sequelize.fn('COUNT', sequelize.col('barcodeType')), 'DESC']]
        });

        const medicationsWithBarcodes = await BarcodeMapping.count({
            distinct: true,
            col: 'medicationId'
        });

        const medicationsWithoutBarcodes = await Medication.count() - medicationsWithBarcodes;

        return {
            totalBarcodes,
            byType: typeStats,
            medicationsWithBarcodes,
            medicationsWithoutBarcodes
        };
    }

    async searchBarcodes(query) {
        const barcodes = await BarcodeMapping.findAll({
            where: {
                [Op.or]: [
                    { barcode: { [Op.iLike]: `%${query}%` } },
                    { pzn: { [Op.iLike]: `%${query}%` } },
                    { packageSize: { [Op.iLike]: `%${query}%` } }
                ]
            },
            include: [Medication],
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        return barcodes;
    }

    async validateBarcode(barcode, barcodeType) {
        // Basic barcode validation based on type
        const validators = {
            'EAN-13': (code) => /^\d{13}$/.test(code),
            'UPC': (code) => /^\d{12}$/.test(code),
            'Code128': (code) => code.length >= 1 && code.length <= 80,
            'DataMatrix': (code) => code.length >= 1 && code.length <= 3116
        };

        const validator = validators[barcodeType];
        if (!validator) {
            throw new Error('Unbekannter Barcode-Typ');
        }

        if (!validator(barcode)) {
            throw new Error(`Ungültiger ${barcodeType} Barcode`);
        }

        return true;
    }

    async bulkImportBarcodes(barcodeData) {
        const results = {
            success: [],
            errors: []
        };

        for (const data of barcodeData) {
            try {
                const barcode = await this.createBarcodeMapping(data);
                results.success.push(barcode);
            } catch (error) {
                results.errors.push({
                    data,
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = new BarcodeService();