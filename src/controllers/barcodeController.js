const barcodeService = require('../services/barcodeService');
const { validationResult } = require('express-validator');

class BarcodeController {
    async scanBarcode(req, res) {
        try {
            const barcode = req.params.barcode;
            const result = await barcodeService.scanBarcode(barcode);
            res.json(result);
        } catch (error) {
            if (error.message === 'Barcode nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Scannen des Barcodes:', error);
            res.status(500).json({ error: 'Serverfehler beim Scannen' });
        }
    }

    async createBarcodeMapping(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors)
                return res.status(400).json({
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            // Validate barcode format
            if (req.body.barcode && req.body.barcodeType) {
                try {
                    await barcodeService.validateBarcode(req.body.barcode, req.body.barcodeType);
                } catch (validationError) {
                    return res.status(400).json({ error: validationError.message });
                }
            }

            const barcodeMapping = await barcodeService.createBarcodeMapping(req.body);
            res.status(201).json(barcodeMapping);
        } catch (error) {
            if (error.message === 'Medikament nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Barcode bereits vorhanden') {
                return res.status(409).json({ error: error.message });
            }
            console.error('Fehler beim Erstellen des Barcode-Mappings:', error);
            res.status(500).json({ error: 'Serverfehler beim Erstellen' });
        }
    }

    async getBarcodesByMedication(req, res) {
        try {
            const barcodes = await barcodeService.getBarcodesByMedication(req.params.medicationId);
            res.json(barcodes);
        } catch (error) {
            console.error('Fehler beim Abrufen der Barcodes:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Barcodes' });
        }
    }

    async getBarcodeById(req, res) {
        try {
            const barcode = await barcodeService.getBarcodeById(req.params.id);
            res.json(barcode);
        } catch (error) {
            if (error.message === 'Barcode-Mapping nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Abrufen des Barcode-Mappings:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen' });
        }
    }

    async updateBarcodeMapping(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            // Validate barcode format if being updated
            if (req.body.barcode && req.body.barcodeType) {
                try {
                    await barcodeService.validateBarcode(req.body.barcode, req.body.barcodeType);
                } catch (validationError) {
                    return res.status(400).json({ error: validationError.message });
                }
            }

            const barcodeMapping = await barcodeService.updateBarcodeMapping(req.params.id, req.body);
            res.json(barcodeMapping);
        } catch (error) {
            if (error.message === 'Barcode-Mapping nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Medikament nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Barcode bereits vorhanden') {
                return res.status(409).json({ error: error.message });
            }
            console.error('Fehler beim Aktualisieren des Barcode-Mappings:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktualisieren' });
        }
    }

    async deleteBarcodeMapping(req, res) {
        try {
            const result = await barcodeService.deleteBarcodeMapping(req.params.id);
            res.json(result);
        } catch (error) {
            if (error.message === 'Barcode-Mapping nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Löschen des Barcode-Mappings:', error);
            res.status(500).json({ error: 'Serverfehler beim Löschen' });
        }
    }

    async getAllBarcodeMappings(req, res) {
        try {
            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                medicationId: req.query.medicationId,
                barcodeType: req.query.barcodeType
            };

            const result = await barcodeService.getAllBarcodeMappings(options);
            res.json(result);
        } catch (error) {
            console.error('Fehler beim Abrufen aller Barcode-Mappings:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen' });
        }
    }

    async getBarcodeStatistics(req, res) {
        try {
            const statistics = await barcodeService.getBarcodeStatistics();
            res.json(statistics);
        } catch (error) {
            console.error('Fehler beim Abrufen der Barcode-Statistiken:', error);
            res.status(500).json({ error: 'Serverfehler bei den Statistiken' });
        }
    }

    async searchBarcodes(req, res) {
        try {
            const query = req.query.q;
            if (!query) {
                return res.status(400).json({ error: 'Suchbegriff erforderlich' });
            }

            const barcodes = await barcodeService.searchBarcodes(query);
            res.json(barcodes);
        } catch (error) {
            console.error('Fehler bei der Barcode-Suche:', error);
            res.status(500).json({ error: 'Serverfehler bei der Suche' });
        }
    }

    async validateBarcode(req, res) {
        try {
            const { barcode, barcodeType } = req.body;
            const isValid = await barcodeService.validateBarcode(barcode, barcodeType);
            res.json({ valid: isValid });
        } catch (error) {
            res.status(400).json({
                valid: false,
                error: error.message
            });
        }
    }

    async bulkImportBarcodes(req, res) {
        try {
            const { barcodes } = req.body;

            if (!Array.isArray(barcodes) || barcodes.length === 0) {
                return res.status(400).json({ error: 'Array von Barcodes erforderlich' });
            }

            const results = await barcodeService.bulkImportBarcodes(barcodes);
            res.status(201).json(results);
        } catch (error) {
            console.error('Fehler beim Bulk-Import:', error);
            res.status(500).json({ error: 'Serverfehler beim Bulk-Import' });
        }
    }
}

module.exports = new BarcodeController();