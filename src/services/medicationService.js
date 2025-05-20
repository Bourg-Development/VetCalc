const { Medication, BarcodeMapping } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

class MedicationService {
    async getAllMedications(options = {}) {
        const { search, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { activeIngredient: { [Op.iLike]: `%${search}%` } },
                    { manufacturer: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const medications = await Medication.findAndCountAll({
            where: whereClause,
            include: [BarcodeMapping],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
        });

        return {
            medications: medications.rows,
            totalCount: medications.count,
            totalPages: Math.ceil(medications.count / limit),
            currentPage: parseInt(page)
        };
    }

    async getMedicationById(id) {
        const medication = await Medication.findByPk(id, {
            include: [BarcodeMapping]
        });

        if (!medication) {
            throw new Error('Medikament nicht gefunden');
        }

        return medication;
    }

    async createMedication(medicationData) {
        return await Medication.create(medicationData);
    }

    async updateMedication(id, medicationData) {
        const medication = await Medication.findByPk(id);

        if (!medication) {
            throw new Error('Medikament nicht gefunden');
        }

        await medication.update(medicationData);
        return medication;
    }

    async deleteMedication(id) {
        const medication = await Medication.findByPk(id);

        if (!medication) {
            throw new Error('Medikament nicht gefunden');
        }

        await medication.destroy();
        return { message: 'Medikament gelöscht' };
    }

    async searchMedications(query) {
        return await Medication.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { activeIngredient: { [Op.iLike]: `%${query}%` } },
                    { manufacturer: { [Op.iLike]: `%${query}%` } }
                ]
            },
            limit: 10,
            order: [['name', 'ASC']]
        });
    }

    async getMedicationsByCategory(form) {
        return await Medication.findAll({
            where: { form },
            include: [BarcodeMapping],
            order: [['name', 'ASC']]
        });
    }

    async getMedicationStatistics() {
        const totalCount = await Medication.count();
        const formStats = await Medication.findAll({
            attributes: [
                'form',
                [sequelize.fn('COUNT', sequelize.col('form')), 'count']
            ],
            group: 'form',
            order: [[sequelize.fn('COUNT', sequelize.col('form')), 'DESC']]
        });

        const prescriptionStats = await Medication.findAll({
            attributes: [
                'prescriptionRequired',
                [sequelize.fn('COUNT', sequelize.col('prescriptionRequired')), 'count']
            ],
            group: 'prescriptionRequired'
        });

        return {
            total: totalCount,
            byForm: formStats,
            byPrescription: prescriptionStats
        };
    }
}

module.exports = new MedicationService();