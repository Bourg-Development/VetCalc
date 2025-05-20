const express = require('express');
const router = express.Router();

const medicationRoutes = require('./medicationRoutes');
const dosageRoutes = require('./dosageRoutes');
const barcodeRoutes = require('./barcodeRoutes');

router.use('/medications', medicationRoutes);
router.use('/dosage', dosageRoutes);
router.use('/barcode', barcodeRoutes);

module.exports = router;