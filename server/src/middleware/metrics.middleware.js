const systemMonitoring = require('../services/system-monitoring.service');

/**
 * Middleware to track API request metrics
 */
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Override res.end to capture response time and status
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;
        const isError = res.statusCode >= 400;

        // Record request metrics
        systemMonitoring.recordRequest(responseTime, isError);

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = metricsMiddleware;
