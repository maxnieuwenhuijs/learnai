const { SystemMetrics } = require('../models');
const os = require('os');
const process = require('process');

class SystemMonitoringService {
    constructor() {
        this.startTime = Date.now();
        this.requestCounts = {
            total: 0,
            errors: 0,
            responseTimes: []
        };
    }

    /**
     * Record a system metric
     */
    async recordMetric(name, value, unit = null, category = 'system', metadata = null) {
        try {
            await SystemMetrics.create({
                metric_name: name,
                metric_value: value,
                metric_unit: unit,
                category,
                metadata,
                recorded_at: new Date()
            });
        } catch (error) {
            console.error('Failed to record metric:', error);
        }
    }

    /**
     * Get system performance metrics
     */
    getSystemMetrics() {
        const uptime = process.uptime();
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        return {
            uptime: uptime,
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            system: {
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                loadAverage: os.loadavg(),
                platform: os.platform(),
                arch: os.arch()
            }
        };
    }

    /**
     * Calculate system uptime percentage
     */
    getUptimePercentage() {
        const uptimeSeconds = process.uptime();
        const totalSeconds = (Date.now() - this.startTime) / 1000;
        return totalSeconds > 0 ? (uptimeSeconds / totalSeconds) * 100 : 100;
    }

    /**
     * Get average response time
     */
    getAverageResponseTime() {
        if (this.requestCounts.responseTimes.length === 0) return 0;

        const sum = this.requestCounts.responseTimes.reduce((a, b) => a + b, 0);
        return sum / this.requestCounts.responseTimes.length;
    }

    /**
     * Get error rate
     */
    getErrorRate() {
        if (this.requestCounts.total === 0) return 0;
        return (this.requestCounts.errors / this.requestCounts.total) * 100;
    }

    /**
     * Record request metrics
     */
    recordRequest(responseTime, isError = false) {
        this.requestCounts.total++;
        if (isError) this.requestCounts.errors++;

        this.requestCounts.responseTimes.push(responseTime);

        // Keep only last 1000 response times to prevent memory issues
        if (this.requestCounts.responseTimes.length > 1000) {
            this.requestCounts.responseTimes = this.requestCounts.responseTimes.slice(-1000);
        }
    }

    /**
     * Get performance metrics for Super Admin dashboard
     */
    async getPerformanceMetrics() {
        const systemMetrics = this.getSystemMetrics();

        return {
            systemUptime: this.getUptimePercentage(),
            avgResponseTime: this.getAverageResponseTime(),
            errorRate: this.getErrorRate(),
            dbQueries: this.requestCounts.total, // Simplified - would be actual DB query count in production
            memory: {
                used: ((systemMetrics.system.totalMemory - systemMetrics.system.freeMemory) / systemMetrics.system.totalMemory * 100).toFixed(2),
                total: (systemMetrics.system.totalMemory / (1024 * 1024 * 1024)).toFixed(2), // GB
                free: (systemMetrics.system.freeMemory / (1024 * 1024 * 1024)).toFixed(2) // GB
            },
            cpu: {
                loadAverage: systemMetrics.system.loadAverage[0].toFixed(2)
            },
            uptime: {
                seconds: systemMetrics.uptime,
                formatted: this.formatUptime(systemMetrics.uptime)
            }
        };
    }

    /**
     * Format uptime in human readable format
     */
    formatUptime(seconds) {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);

        return `${days}d ${hours}h ${minutes}m`;
    }

    /**
     * Record system metrics to database (called periodically)
     */
    async recordSystemMetrics() {
        try {
            const metrics = this.getSystemMetrics();
            const timestamp = new Date();

            // Record key metrics
            await Promise.all([
                this.recordMetric('memory_usage',
                    ((metrics.system.totalMemory - metrics.system.freeMemory) / metrics.system.totalMemory * 100),
                    'percentage', 'system'),
                this.recordMetric('cpu_load', metrics.system.loadAverage[0], 'load', 'system'),
                this.recordMetric('uptime', metrics.uptime, 'seconds', 'system'),
                this.recordMetric('heap_used', metrics.memory.heapUsed, 'bytes', 'application'),
                this.recordMetric('response_time', this.getAverageResponseTime(), 'ms', 'application'),
                this.recordMetric('error_rate', this.getErrorRate(), 'percentage', 'application')
            ]);
        } catch (error) {
            console.error('Failed to record system metrics:', error);
        }
    }

    /**
     * Get historical metrics for analytics
     */
    async getHistoricalMetrics(metricName, hours = 24) {
        const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

        try {
            const metrics = await SystemMetrics.findAll({
                where: {
                    metric_name: metricName,
                    recorded_at: {
                        [require('sequelize').Op.gte]: startTime
                    }
                },
                order: [['recorded_at', 'ASC']],
                attributes: ['metric_value', 'recorded_at']
            });

            return metrics.map(m => ({
                value: parseFloat(m.metric_value),
                timestamp: m.recorded_at
            }));
        } catch (error) {
            console.error('Failed to get historical metrics:', error);
            return [];
        }
    }

    /**
     * Start periodic metric recording
     */
    startPeriodicRecording(intervalMinutes = 5) {
        setInterval(() => {
            this.recordSystemMetrics();
        }, intervalMinutes * 60 * 1000);

        console.log(`System monitoring started - recording metrics every ${intervalMinutes} minutes`);
    }
}

// Create singleton instance
const systemMonitoring = new SystemMonitoringService();

module.exports = systemMonitoring;
