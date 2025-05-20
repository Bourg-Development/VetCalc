const express = require('express');
const { body } = require('express-validator');
const dosageController = require('../controllers/dosageController');

const router = express.Router();

// Validation middleware
const dosageCalculationValidation = [
    body('medicationId').isUUID().withMessage('Gültige Medikamenten-ID erforderlich'),
    body('patientWeight').isFloat({ min: 0.1 }).withMessage('Gültiges Gewicht erforderlich'),
    body('indication').notEmpty().withMessage('Indikation erforderlich'),
    body('dosagePerKg').isFloat({ min: 0 }).withMessage('Gültige Dosierung pro kg erforderlich'),
    body('frequency').isInt({ min: 1 }).withMessage('Gültige Häufigkeit erforderlich'),
    body('maxDailyDose').optional().isFloat({ min: 0 }).withMessage('Maximaldosis muss positiv sein'),
    body('patientAge').optional().isInt({ min: 0 }).withMessage('Gültiges Alter erforderlich'),
    body('unit').optional().isString().withMessage('Einheit muss ein String sein'),
    body('calculatedBy').optional().isString().withMessage('Berechnender muss ein String sein'),
    body('notes').optional().isString().withMessage('Notizen müssen ein String sein')
];

const pediatricDosageValidation = [
    body('weight').isFloat({ min: 0.1 }).withMessage('Gültiges Gewicht erforderlich'),
    body('age').isInt({ min: 0 }).withMessage('Gültiges Alter in Monaten erforderlich')
];

// Routes
router.get('/', dosageController.getAllDosageCalculations);
router.get('/statistics', dosageController.getDosageStatistics);
router.get('/:id', dosageController.getDosageById);
router.get('/history/:medicationId', dosageController.getDosageHistory);
router.post('/calculate', dosageCalculationValidation, dosageController.calculateDosage);
router.post('/pediatric/:medicationId', pediatricDosageValidation, dosageController.getPediatricDosage);
router.put('/:id', dosageCalculationValidation, dosageController.updateDosageCalculation);
router.delete('/:id', dosageController.deleteDosageCalculation);

module.exports = router;