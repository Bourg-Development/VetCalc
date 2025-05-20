// public/js/utils/helpers.js - Helper utility functions

const utils = {
    // Delay function for simulating async operations
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Format date helper
    formatDate(date, options = {}) {
        const defaults = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('de-DE', { ...defaults, ...options });
    },

    // Format time helper
    formatTime(date, options = {}) {
        const defaults = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        return new Date(date).toLocaleTimeString('de-DE', { ...defaults, ...options });
    },

    // Format currency helper
    formatCurrency(amount, currency = 'EUR') {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // Generate random ID
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Sanitize HTML
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },

    // Form helpers
    form: {
        // Serialize form data
        serialize(form) {
            const formData = new FormData(form);
            const data = {};

            for (const [key, value] of formData.entries()) {
                if (data[key]) {
                    // Handle multiple values (like checkboxes)
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }

            return data;
        },

        // Validate form
        validate(form, rules = {}) {
            const errors = {};
            const data = this.serialize(form);

            for (const [field, fieldRules] of Object.entries(rules)) {
                const value = data[field];

                if (fieldRules.required && (!value || value.trim() === '')) {
                    errors[field] = 'Dieses Feld ist erforderlich';
                    continue;
                }

                if (value && fieldRules.email && !this.isValidEmail(value)) {
                    errors[field] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
                }

                if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
                    errors[field] = `Mindestens ${fieldRules.minLength} Zeichen erforderlich`;
                }

                if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                    errors[field] = `Höchstens ${fieldRules.maxLength} Zeichen erlaubt`;
                }

                if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
                    errors[field] = fieldRules.message || 'Ungültiges Format';
                }
            }

            return {
                isValid: Object.keys(errors).length === 0,
                errors: errors,
                data: data
            };
        },

        // Email validation
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    }
};