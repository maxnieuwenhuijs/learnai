const { AuditLog } = require('../models');

/**
 * Audit logging middleware for Super Admin actions
 */
const auditLogger = {
    /**
     * Log an action to the audit trail
     */
    log: async (options) => {
        try {
            const {
                userId,
                companyId,
                action,
                entityType,
                entityId,
                oldValues,
                newValues,
                metadata,
                severity = 'low',
                description,
                req
            } = options;

            // Extract additional metadata from request if provided
            const auditMetadata = {
                ...metadata,
                ip_address: req?.ip || req?.connection?.remoteAddress,
                user_agent: req?.get('User-Agent'),
                timestamp: new Date().toISOString()
            };

            await AuditLog.create({
                user_id: userId,
                company_id: companyId,
                action,
                entity_type: entityType,
                entity_id: entityId,
                old_values: oldValues,
                new_values: newValues,
                metadata: auditMetadata,
                severity,
                description
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error to avoid disrupting main operation
        }
    },

    /**
     * Middleware function to automatically log API requests
     */
    middleware: (action, entityType, severity = 'low') => {
        return async (req, res, next) => {
            // Store original res.json to intercept response
            const originalJson = res.json;

            res.json = function (data) {
                // Log the action after successful response
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    auditLogger.log({
                        userId: req.user?.id,
                        companyId: req.user?.company_id,
                        action,
                        entityType,
                        entityId: req.params?.id,
                        newValues: req.body,
                        metadata: {
                            method: req.method,
                            url: req.originalUrl,
                            status_code: res.statusCode
                        },
                        severity,
                        description: `${action} via ${req.method} ${req.originalUrl}`,
                        req
                    });
                }

                // Call original json method
                return originalJson.call(this, data);
            };

            next();
        };
    },

    /**
     * Log company creation
     */
    logCompanyCreated: async (userId, company, req) => {
        await auditLogger.log({
            userId,
            companyId: company.id,
            action: 'company_created',
            entityType: 'company',
            entityId: company.id,
            newValues: {
                name: company.name,
                industry: company.industry,
                country: company.country,
                size: company.size
            },
            severity: 'medium',
            description: `Created company: ${company.name}`,
            req
        });
    },

    /**
     * Log company update
     */
    logCompanyUpdated: async (userId, companyId, oldValues, newValues, req) => {
        await auditLogger.log({
            userId,
            companyId,
            action: 'company_updated',
            entityType: 'company',
            entityId: companyId,
            oldValues,
            newValues,
            severity: 'medium',
            description: `Updated company ID: ${companyId}`,
            req
        });
    },

    /**
     * Log company deletion
     */
    logCompanyDeleted: async (userId, company, req) => {
        await auditLogger.log({
            userId,
            companyId: company.id,
            action: 'company_deleted',
            entityType: 'company',
            entityId: company.id,
            oldValues: {
                name: company.name,
                industry: company.industry,
                country: company.country
            },
            severity: 'high',
            description: `Deleted company: ${company.name}`,
            req
        });
    },

    /**
     * Log prompt deletion
     */
    logPromptDeleted: async (userId, prompt, req) => {
        await auditLogger.log({
            userId,
            companyId: prompt.company_id,
            action: 'prompt_deleted',
            entityType: 'prompt',
            entityId: prompt.id,
            oldValues: {
                title: prompt.title,
                status: prompt.status,
                category_id: prompt.category_id
            },
            severity: 'medium',
            description: `Deleted prompt: ${prompt.title}`,
            req
        });
    },

    /**
     * Log database reset
     */
    logDatabaseReset: async (userId, req) => {
        await auditLogger.log({
            userId,
            action: 'database_reset',
            entityType: 'system',
            severity: 'critical',
            description: 'Database reset performed - all data cleared',
            req
        });
    },

    /**
     * Log user creation
     */
    logUserCreated: async (userId, user, req) => {
        await auditLogger.log({
            userId,
            companyId: user.company_id,
            action: 'user_created',
            entityType: 'user',
            entityId: user.id,
            oldValues: null,
            newValues: {
                name: user.name,
                email: user.email,
                role: user.role,
                company_id: user.company_id,
                department_id: user.department_id
            },
            severity: 'medium',
            description: `Created ${user.role} user: ${user.name} (${user.email})`,
            req
        });
    },

    /**
     * Log system maintenance actions
     */
    logSystemMaintenance: async (userId, action, description, req) => {
        await auditLogger.log({
            userId,
            action: `system_${action}`,
            entityType: 'system',
            severity: 'high',
            description,
            req
        });
    }
};

module.exports = auditLogger;
