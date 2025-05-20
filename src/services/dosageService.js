const { DosageCalculation, Medication } = require('../models');
const sequelize = require('sequelize');


class DosageService {
    async calculateDosage(dosageData) {
        const {
            medicationId,
            patientWeight,
            patientAge,
            indication,
            dosagePerKg,
            maxDailyDose,
            frequency,
            unit,
            calculatedBy,
            notes
        } = dosageData;

        // Validate medication exists
        const medication = await Medication.findByPk(medicationId);
        if (!medication) {
            throw new Error('Medikament nicht gefunden');
        }

        // Calculate dosages
        const singleDose = (patientWeight * dosagePerKg) / frequency;
        const dailyDose = patientWeight * dosagePerKg;

        // Check maximum dose constraint
        let calculatedDose = singleDose;
        let warning = null;

        if (maxDailyDose && dailyDose > maxDailyDose) {
            calculatedDose = maxDailyDose / frequency;
            warning = 'Maximaldosis erreicht - Dosis wurde angepasst';
        }

        // Save calculation
        const dosageCalculation = await DosageCalculation.create({
            medicationId,
            patientWeight,
            patientAge,
            indication,
            dosagePerKg,
            maxDailyDose,
            frequency,
            calculatedDose,
            unit: unit || 'mg',
            calculatedBy,
            notes
        });

        // Return complete result with medication
        const result = await DosageCalculation.findByPk(dosageCalculation.id, {
            include: [Medication]
        });

        return {
            calculation: result,
            recommendations: {
                singleDose: calculatedDose,
                dailyDose: Math.min(dailyDose, maxDailyDose || Infinity),
                totalDailyDose: dailyDose,
                frequency,
                unit: unit || 'mg',
                warning
            }
        };
    }

    async getDosageHistory(medicationId) {
        const calculations = await DosageCalculation.findAll({
            where: { medicationId },
            include: [Medication],
            order: [['createdAt', 'DESC']]
        });

        return calculations;
    }

    async getDosageById(id) {
        const calculation = await DosageCalculation.findByPk(id, {
            include: [Medication]
        });

        if (!calculation) {
            throw new Error('Dosierungsberechnung nicht gefunden');
        }

        return calculation;
    }

    async deleteDosageCalculation(id) {
        const calculation = await DosageCalculation.findByPk(id);

        if (!calculation) {
            throw new Error('Dosierungsberechnung nicht gefunden');
        }

        await calculation.destroy();
        return { message: 'Dosierungsberechnung gelöscht' };
    }

    async getAllDosageCalculations(options = {}) {
        const { page = 1, limit = 10, medicationId } = options;
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (medicationId) {
            whereClause.medicationId = medicationId;
        }

        const calculations = await DosageCalculation.findAndCountAll({
            where: whereClause,
            include: [Medication],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            calculations: calculations.rows,
            totalCount: calculations.count,
            totalPages: Math.ceil(calculations.count / limit),
            currentPage: parseInt(page)
        };
    }

    async getDosageStatistics() {
        const totalCalculations = await DosageCalculation.count();

        const indicationStats = await DosageCalculation.findAll({
            attributes: [
                'indication',
                [sequelize.fn('COUNT', sequelize.col('indication')), 'count']
            ],
            group: 'indication',
            order: [[sequelize.fn('COUNT', sequelize.col('indication')), 'DESC']],
            limit: 10
        });

        const avgDoseByIndication = await DosageCalculation.findAll({
            attributes: [
                'indication',
                [sequelize.fn('AVG', sequelize.col('calculatedDose')), 'avgDose'],
                [sequelize.fn('AVG', sequelize.col('patientWeight')), 'avgWeight']
            ],
            group: 'indication',
            order: [['indication', 'ASC']]
        });

        return {
            totalCalculations,
            topIndications: indicationStats,
            averageDoses: avgDoseByIndication
        };
    }

    // Helper method for common pediatric dosing
    async getPediatricDosage(medicationId, weightKg, ageMonths) {
        const medication = await Medication.findByPk(medicationId);
        if (!medication) {
            throw new Error('Medikament nicht gefunden');
        }

        // Basic pediatric dosing rules (simplified)
        let dosagePerKg;
        const activeIngredient = medication.activeIngredient.toLowerCase();

        // Example pediatric dosing (should be from a proper database)
        const pediatricDosing = {
            'paracetamol': { dose: 15, maxDaily: 60, unit: 'mg/kg' },
            'ibuprofen': { dose: 10, maxDaily: 40, unit: 'mg/kg' },
            'amoxicillin': { dose: 25, maxDaily: 100, unit: 'mg/kg' }
        };

        const dosing = pediatricDosing[activeIngredient];
        if (!dosing) {
            throw new Error('Keine pädiatrische Dosierung verfügbar für dieses Medikament');
        }

        return {
            medication: medication.name,
            patientWeight: weightKg,
            patientAge: ageMonths,
            recommendedDose: dosing.dose,
            maxDailyDose: dosing.maxDaily,
            unit: dosing.unit,
            calculatedSingleDose: (weightKg * dosing.dose) / 3, // Assuming TID
            calculatedDailyDose: weightKg * dosing.dose
        };
    }
}

module.exports = new DosageService();