const medicationService = require('../services/medicationService');
const { validationResult } = require('express-validator');

class MedicationController {
    async getAllMedications(req, res) {
        try {
            const options = {
                search: req.query.search,
                page: req.query.page || 1,
                limit: req.query.limit || 10
            };

            const result = await medicationService.getAllMedications(options);
            res.json(result);
        } catch (error) {
            console.error('Fehler beim Abrufen der Medikamente:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Medikamente' });
        }
    }

    async getMedicationById(req, res) {
        try {
            console.log(req.params.id)
            const medication = await medicationService.getMedicationById(req.params.id);
            res.json(medication);
        } catch (error) {
            if (error.message === 'Medikament nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Abrufen des Medikaments:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen des Medikaments' });
        }
    }

    async createMedication(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array())
                return res.status(400).json({
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            const medication = await medicationService.createMedication(req.body);
            res.status(201).json(medication);
        } catch (error) {
            console.error('Fehler beim Erstellen des Medikaments:', error);
            res.status(500).json({ error: 'Serverfehler beim Erstellen des Medikaments' });
        }
    }

    async updateMedication(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validierungsfehler',
                    details: errors.array()
                });
            }

            const medication = await medicationService.updateMedication(req.params.id, req.body);
            res.json(medication);
        } catch (error) {
            if (error.message === 'Medikament nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Aktualisieren des Medikaments:', error);
            res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Medikaments' });
        }
    }

    async deleteMedication(req, res) {
        try {
            const result = await medicationService.deleteMedication(req.params.id);
            res.json(result);
        } catch (error) {
            if (error.message === 'Medikament nicht gefunden') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Fehler beim Löschen des Medikaments:', error);
            res.status(500).json({ error: 'Serverfehler beim Löschen des Medikaments' });
        }
    }

    async searchMedications(req, res) {
        try {
            const query = req.query.q;
            if (!query) {
                return res.status(400).json({ error: 'Suchbegriff erforderlich' });
            }

            const medications = await medicationService.searchMedications(query);
            res.json(medications);
        } catch (error) {
            console.error('Fehler bei der Medikamentensuche:', error);
            res.status(500).json({ error: 'Serverfehler bei der Suche' });
        }
    }

    async getMedicationsByCategory(req, res) {
        try {
            const form = req.params.form;
            const medications = await medicationService.getMedicationsByCategory(form);
            res.json(medications);
        } catch (error) {
            console.error('Fehler beim Abrufen der Medikamente nach Kategorie:', error);
            res.status(500).json({ error: 'Serverfehler beim Abrufen der Kategorie' });
        }
    }

    async getMedicationStatistics(req, res) {
        try {
            const statistics = await medicationService.getMedicationStatistics();
            res.json(statistics);
        } catch (error) {
            console.error('Fehler beim Abrufen der Statistiken:', error);
            res.status(500).json({ error: 'Serverfehler bei Statistiken' });
        }
    }
}

module.exports = new MedicationController();