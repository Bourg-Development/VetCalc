// public/js/utils/api.js - API utility functions

const api = {
    baseURL: '/api',

    // Default headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    },

    // Generic request handler
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

        const config = {
            headers: this.getHeaders(),
            ...options
        };

        // Add body if provided and not GET request
        if (config.body && typeof config.body === 'object' && config.method !== 'GET') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);

            // Handle non-OK responses
            if (!response.ok) {
                console.log(response)
                const errorData = await response.json().catch(() => ({
                    error: `HTTP Error: ${response.status} ${response.statusText}`
                }));
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            // Return JSON data
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    },

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    },

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    },

    // PATCH request
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }
};