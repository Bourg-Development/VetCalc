// public/js/components/charts.js - Charts management with Chart.js

// Initialize Charts
async function initCharts() {
    try {
        // Only initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            await Promise.all([
                initUsageChart(),
                initCategoriesChart()
            ]);
        } else {
            console.warn('Chart.js not loaded, skipping chart initialization');
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
        showAlert('Fehler beim Laden der Diagramme', 'error');
    }
}

async function initUsageChart() {
    const canvas = document.getElementById('usage-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Simulate usage data for the last 7 days
    const usageData = await simulateUsageData();

    // Get CSS custom properties for consistent colors
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();

    dashboardData.charts.usage = new Chart(ctx, {
        type: 'line',
        data: {
            labels: usageData.labels,
            datasets: [{
                label: 'Dosierungsberechnungen',
                data: usageData.calculations,
                borderColor: secondaryColor,
                backgroundColor: secondaryColor + '20',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: secondaryColor,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Barcode Scans',
                data: usageData.scans,
                borderColor: primaryColor,
                backgroundColor: primaryColor + '20',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: primaryColor,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Poppins'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Poppins',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 12
                    },
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Poppins',
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Poppins',
                            size: 11
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

async function initCategoriesChart() {
    const canvas = document.getElementById('categories-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Simulate categories data
    const categoriesData = await simulateCategoriesData();

    // Color palette for categories
    const colors = [
        '#12283A', // Navy Blue
        '#2992D0', // Primary Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6'  // Purple
    ];

    dashboardData.charts.categories = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoriesData.labels,
            datasets: [{
                data: categoriesData.data,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 4,
                hoverBackgroundColor: colors.map(color => color + 'CC')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Poppins'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const dataset = data.datasets[0];
                                    const backgroundColor = dataset.backgroundColor[i];
                                    const value = dataset.data[i];
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);

                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: backgroundColor,
                                        strokeStyle: backgroundColor,
                                        lineWidth: 0,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Poppins',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 12
                    },
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            onHover: (event, elements) => {
                canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
        }
    });

    // Add click handler for category chart
    canvas.addEventListener('click', (event) => {
        const elements = dashboardData.charts.categories.getElementsAtEventForMode(
            event, 'nearest', { intersect: true }, true
        );

        if (elements.length > 0) {
            const element = elements[0];
            const categoryIndex = element.index;
            const category = categoriesData.labels[categoryIndex];

            showAlert(`Navigation zu Kategorie: ${category}`, 'info');
            // In a real app: window.location.href = `/medications/category/${category}`;
        }
    });
}

async function simulateUsageData() {
    await utils.delay(100);

    const labels = [];
    const calculations = [];
    const scans = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric' }));

        // Simulate realistic usage patterns
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Lower usage on weekends
        const calculationBase = isWeekend ? 8 : 20;
        const scanBase = isWeekend ? 5 : 15;

        calculations.push(Math.floor(Math.random() * calculationBase) + (isWeekend ? 2 : 5));
        scans.push(Math.floor(Math.random() * scanBase) + (isWeekend ? 1 : 3));
    }

    return { labels, calculations, scans };
}

async function simulateCategoriesData() {
    await utils.delay(100);

    // Simulated medication categories with realistic distributions
    return {
        labels: ['Antibiotika', 'Schmerzmittel', 'Impfstoffe', 'Hormone', 'Vitamine', 'Sonstige'],
        data: [25, 20, 15, 12, 8, 20]
    };
}

// Update charts with new data
async function updateCharts() {
    try {
        showLoading();

        // Update usage chart
        if (dashboardData.charts.usage) {
            const newUsageData = await simulateUsageData();

            dashboardData.charts.usage.data.labels = newUsageData.labels;
            dashboardData.charts.usage.data.datasets[0].data = newUsageData.calculations;
            dashboardData.charts.usage.data.datasets[1].data = newUsageData.scans;
            dashboardData.charts.usage.update('active');
        }

        // Update categories chart
        if (dashboardData.charts.categories) {
            const newCategoriesData = await simulateCategoriesData();

            dashboardData.charts.categories.data.labels = newCategoriesData.labels;
            dashboardData.charts.categories.data.datasets[0].data = newCategoriesData.data;
            dashboardData.charts.categories.update('active');
        }

        showAlert('Diagramme aktualisiert', 'success');
    } catch (error) {
        console.error('Error updating charts:', error);
        showAlert('Fehler beim Aktualisieren der Diagramme', 'error');
    } finally {
        hideLoading();
    }
}

// Export chart data
function exportChartData(chartType) {
    if (!dashboardData.charts[chartType]) {
        showAlert('Diagramm nicht gefunden', 'error');
        return;
    }

    const chart = dashboardData.charts[chartType];
    const data = {
        labels: chart.data.labels,
        datasets: chart.data.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data
        }))
    };

    // Convert to CSV format
    let csv = '';

    if (chartType === 'usage') {
        csv = 'Datum,Dosierungsberechnungen,Barcode Scans\n';
        data.labels.forEach((label, index) => {
            csv += `${label},${data.datasets[0].data[index]},${data.datasets[1].data[index]}\n`;
        });
    } else if (chartType === 'categories') {
        csv = 'Kategorie,Anzahl\n';
        data.labels.forEach((label, index) => {
            csv += `${label},${data.datasets[0].data[index]}\n`;
        });
    }

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetcalc-${chartType}-${utils.formatDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showAlert('Daten exportiert', 'success');
}

// Responsive chart handling
function handleChartResize() {
    if (dashboardData.charts.usage) {
        dashboardData.charts.usage.resize();
    }
    if (dashboardData.charts.categories) {
        dashboardData.charts.categories.resize();
    }
}

// Setup resize observer for charts
function setupChartResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
        const chartContainers = document.querySelectorAll('.charts-section .dashboard-card');

        const resizeObserver = new ResizeObserver(utils.throttle(() => {
            handleChartResize();
        }, 100));

        chartContainers.forEach(container => {
            resizeObserver.observe(container);
        });
    } else {
        // Fallback for browsers without ResizeObserver
        window.addEventListener('resize', utils.throttle(handleChartResize, 250));
    }
}

// Cleanup charts
function destroyCharts() {
    if (dashboardData.charts.usage) {
        dashboardData.charts.usage.destroy();
        dashboardData.charts.usage = null;
    }
    if (dashboardData.charts.categories) {
        dashboardData.charts.categories.destroy();
        dashboardData.charts.categories = null;
    }
}

// Export functions
window.initCharts = initCharts;
window.updateCharts = updateCharts;
window.exportChartData = exportChartData;
window.destroyCharts = destroyCharts;
window.setupChartResizeObserver = setupChartResizeObserver;