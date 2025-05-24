const express = require('express');
const { body } = require('express-validator');
const medicationController = require('../controllers/medicationController');

const router = express.Router();

// Validation middleware
const medicationValidation = [
    body('name').notEmpty().withMessage('Name ist erforderlich'),
    body('activeIngredient').notEmpty().withMessage('Wirkstoff ist erforderlich'),
    body('form').isIn(['Tablette', 'Kapsel', 'Tropfen', 'Sirup', 'Injektion', 'Paste', 'Puder', 'Salbe', 'Spray', null])
        .withMessage('Ungültige Darreichungsform')
];

const updateValidation = [
    body('name').optional().notEmpty().withMessage('Name darf nicht leer sein'),
    body('activeIngredient').optional().notEmpty().withMessage('Wirkstoff darf nicht leer sein'),
    body('form').optional().isIn(['Tablette', 'Kapsel', 'Tropfen', 'Sirup', 'Injektion', 'Paste', 'Puder','Salbe', 'Spray', null])
        .withMessage('Ungültige Darreichungsform')
];

// Routes
router.get('/', medicationController.getAllMedications);
router.get('/search', medicationController.searchMedications);
router.get('/statistics', medicationController.getMedicationStatistics);
router.get('/category/:form', medicationController.getMedicationsByCategory);
router.get('/:id', medicationController.getMedicationById);
router.post('/', medicationValidation, medicationController.createMedication);
router.put('/:id', updateValidation, medicationController.updateMedication);
router.delete('/:id', medicationController.deleteMedication);

module.exports = router;