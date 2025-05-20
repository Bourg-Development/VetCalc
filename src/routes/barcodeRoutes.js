const express = require('express');
const { body } = require('express-validator');
const barcodeController = require('../controllers/barcodeController');

const router = express.Router();

// Validation middleware
const barcodeValidation = [
    body('medicationId').isUUID().withMessage('Gültige Medikamenten-ID erforderlich'),
    body('barcode').notEmpty().withMessage('Barcode erforderlich'),
    body('barcodeType').isIn(['EAN-13', 'UPC', 'Code128', 'DataMatrix'])
        .withMessage('Ungültiger Barcode-Typ'),
    body('pzn').optional({ nullable: true }).isString().withMessage('PZN muss ein String sein'),
    body('packageSize').optional({ nullable: true }).isString().withMessage('Packungsgröße muss ein String sein'),
    body('batchNumber').optional({ nullable: true }).isString().withMessage('Chargennummer muss ein String sein'),
    body('expiryDate').optional({ nullable: true }).isISO8601().withMessage('Gültiges Ablaufdatum erforderlich')
];

const updateBarcodeValidation = [
    body('medicationId').optional({ nullable: true }).isUUID().withMessage('Gültige Medikamenten-ID erforderlich'),
    body('barcode').optional({ nullable: true }).notEmpty().withMessage('Barcode darf nicht leer sein'),
    body('barcodeType').optional({ nullable: true }).isIn(['EAN-13', 'UPC', 'Code128', 'DataMatrix'])
        .withMessage('Ungültiger Barcode-Typ'),
    body('pzn').optional({ nullable: true }).isString().withMessage('PZN muss ein String sein'),
    body('packageSize').optional({ nullable: true }).isString().withMessage('Packungsgröße muss ein String sein'),
    body('batchNumber').optional({ nullable: true }).isString().withMessage('Chargennummer muss ein String sein'),
    body('expiryDate').optional({ nullable: true }).isISO8601().withMessage('Gültiges Ablaufdatum erforderlich')
];

const barcodeValidationOnly = [
    body('barcode').notEmpty().withMessage('Barcode erforderlich'),
    body('barcodeType').isIn(['EAN-13', 'UPC', 'Code128', 'DataMatrix'])
        .withMessage('Ungültiger Barcode-Typ')
];

// Routes
router.get('/', barcodeController.getAllBarcodeMappings);
router.get('/search', barcodeController.searchBarcodes);
router.get('/statistics', barcodeController.getBarcodeStatistics);
router.get('/scan/:barcode', barcodeController.scanBarcode);
router.get('/medication/:medicationId', barcodeController.getBarcodesByMedication);
router.get('/:id', barcodeController.getBarcodeById);
router.post('/', barcodeValidation, barcodeController.createBarcodeMapping);
router.post('/validate', barcodeValidationOnly, barcodeController.validateBarcode);
router.post('/bulk-import', barcodeController.bulkImportBarcodes);
router.put('/:id', updateBarcodeValidation, barcodeController.updateBarcodeMapping);
router.delete('/:id', barcodeController.deleteBarcodeMapping);

module.exports = router;