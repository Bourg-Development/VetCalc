const dosageService = require('../services/dosageService');
const { validationResult } = require('express-validator');

class DosageController {
    async calculateDosage(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            const result = await dosageService.calculateDosage(req.body);
            res.status(201).json(result);
        } catch (error) {
            if (error.message === 'Medikament nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler bei der Dosierungsberechnung:', error);
            res.status(500).json({ error: 'Serverfehler bei der Dosierungsberechnung' });
        }
    }

    async getDosageHistory(req, res) {
        try {
            const calculations = await dosageService.getDosageHistory(req.params.medicationId);
            res.json(calculations);
        } catch (error) {
            console.error('Fehler beim Abrufen der Dosierungshistorie:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Historie' });
        }
    }

    async getDosageById(req, res) {
        try {
            const calculation = await dosageService.getDosageById(req.params.id);
            res.json(calculation);
        } catch (error) {
            if (error.message === 'Dosierungsberechnung nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Abrufen der Dosierungsberechnung:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Berechnung' });
        }
    }

    async deleteDosageCalculation(req, res) {
        try {
            const result = await dosageService.deleteDosageCalculation(req.params.id);
            res.json(result);
        } catch (error) {
            if (error.message === 'Dosierungsberechnung nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Löschen der Dosierungsberechnung:', error);
            res.status(500).json({ error: 'Serverfehler beim Löschen' });
        }
    }

    async getAllDosageCalculations(req, res) {
        try {
            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                medicationId: req.query.medicationId
            };

            const result = await dosageService.getAllDosageCalculations(options);
            res.json(result);
        } catch (error) {
            console.error('Fehler beim Abrufen aller Dosierungsberechnungen:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Berechnungen' });
        }
    }

    async getDosageStatistics(req, res) {
        try {
            const statistics = await dosageService.getDosageStatistics();
            res.json(statistics);
        } catch (error) {
            console.error('Fehler beim Abrufen der Dosierungsstatistiken:', error);
            res.status(500).json({ error: 'Serverfehler bei den Statistiken' });
        }
    }

    async getPediatricDosage(req, res) {
        try {
            const { medicationId } = req.params;
            const { weight, age } = req.body;

            if (!weight || !age) {
                return res.status(400).json({
                    error: 'Gewicht und Alter sind erforderlich'
                });
            }

            const result = await dosageService.getPediatricDosage(
                medicationId,
                parseFloat(weight),
                parseInt(age)
            );
            res.json(result);
        } catch (error) {
            if (error.message.includes('nicht gefunden') || error.message.includes('verfügbar')) {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler bei der pädiatrischen Dosierung:', error);
            res.status(500).json({ error: 'Serverfehler bei der pädiatrischen Dosierung' });
        }
    }

    async updateDosageCalculation(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            // Implementation for updating dosage calculation
            // This would need to be added to the service as well
            res.status(501).json({ error: 'Update-Funktion noch nicht implementiert' });
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Dosierungsberechnung:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktualisieren' });
        }
    }
}

module.exports = new DosageController();