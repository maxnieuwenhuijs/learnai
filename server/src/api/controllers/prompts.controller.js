const { PromptCategory, Prompt, PromptVersion, PromptApproval, PromptUsage, User, Company, Department } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

// Helper function to replace variables in prompt content
const replaceVariables = (content, variables) => {
    if (!variables || !content) return content;

    let processedContent = content;

    // Handle both array format (from prompt.variables) and object format (from frontend)
    if (Array.isArray(variables)) {
        variables.forEach(variable => {
            const placeholder = `{{${variable.name}}}`;
            const value = variable.value || variable.default || '';
            processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
        });
    } else {
        // Handle object format from frontend
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            const processedValue = value || '';
            processedContent = processedContent.replace(new RegExp(placeholder, 'g'), processedValue);
        });
    }

    return processedContent;
};

// Get all prompt categories
exports.getCategories = async (req, res) => {
    try {
        const { company_id } = req.user;

        // First get all categories
        const categories = await PromptCategory.findAll({
            where: {
                [Op.or]: [
                    { company_id: null }, // System-wide categories
                    { company_id: company_id } // Company-specific categories
                ],
                is_active: true
            },
            order: [['name', 'ASC']]
        });

        // Then get prompt counts for each category
        const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
            const promptCount = await Prompt.count({
                where: {
                    category_id: category.id,
                    company_id: company_id,
                    status: { [Op.in]: ['approved', 'draft'] }
                }
            });

            return {
                ...category.toJSON(),
                prompt_count: promptCount
            };
        }));

        res.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching prompt categories:', error);
        res.status(500).json({ error: 'Failed to fetch prompt categories' });
    }
};

// Create new prompt category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, color, icon } = req.body;
        const { company_id } = req.user;

        const category = await PromptCategory.create({
            name,
            description,
            color: color || '#6366f1',
            icon: icon || 'MessageSquare',
            company_id
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating prompt category:', error);
        res.status(500).json({ error: 'Failed to create prompt category' });
    }
};

// Get all prompts with filtering
exports.getPrompts = async (req, res) => {
    try {
        const { company_id, department_id, id: user_id } = req.user;
        const {
            category_id,
            status = 'all',
            is_template,
            search,
            tags,
            page = 1,
            limit = 20,
            type = 'all' // 'personal', 'company', 'all'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause based on prompt type
        let where = {
            company_id: company_id,
            status: { [Op.ne]: 'archived' } // Exclude archived prompts
        };

        // Filter by prompt type
        if (type === 'personal') {
            // Only show user's own prompts (all statuses)
            where.created_by = user_id;
        } else if (type === 'company') {
            // Only show company prompts (approved only)
            where.created_by = { [Op.ne]: user_id };
            where.status = 'approved';
        } else {
            // Show both personal and approved company prompts
            where[Op.or] = [
                { created_by: user_id }, // User's own prompts (all statuses)
                {
                    created_by: { [Op.ne]: user_id },
                    status: 'approved' // Others' approved prompts
                }
            ];
        }

        // If status is specified, filter by it (but still exclude archived)
        if (status && status !== 'all') {
            where.status = status;
            // Remove the archived filter if a specific status is requested
            delete where.status;
            where.status = status;
        }

        // Add filters
        if (category_id) where.category_id = category_id;
        if (is_template !== undefined) where.is_template = is_template === 'true';
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            where.tags = {
                [Op.contains]: tagArray
            };
        }

        // Add search functionality
        if (search) {
            where[Op.and] = [
                where[Op.and] || {},
                {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } },
                        { content: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        const { count, rows: prompts } = await Prompt.findAndCountAll({
            where,
            include: [
                {
                    model: PromptCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'color', 'icon']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['updated_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            prompts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        res.status(500).json({ error: 'Failed to fetch prompts' });
    }
};

// Get single prompt with full details
exports.getPromptById = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id
            },
            include: [
                {
                    model: PromptCategory,
                    as: 'category'
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: PromptVersion,
                    as: 'versions',
                    include: [{
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }],
                    order: [['version_number', 'DESC']]
                },
                {
                    model: Prompt,
                    as: 'parent',
                    attributes: ['id', 'title'],
                    required: false
                },
                {
                    model: Prompt,
                    as: 'children',
                    attributes: ['id', 'title', 'status'],
                    required: false
                }
            ]
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        res.json(prompt);
    } catch (error) {
        console.error('Error fetching prompt:', error);
        res.status(500).json({ error: 'Failed to fetch prompt' });
    }
};

// Create new prompt
exports.createPrompt = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            title,
            description,
            content,
            variables = [],
            category_id,
            department_id,
            is_template = false,
            is_company_prompt = false,
            tags = [],
            status = 'draft'
        } = req.body;

        const { company_id, id: user_id } = req.user;

        // Determine final status based on company prompt setting
        let finalStatus = status;
        if (is_company_prompt && status === 'draft') {
            finalStatus = 'pending_review';
        }

        // Create the prompt
        const prompt = await Prompt.create({
            title,
            description,
            content,
            variables,
            category_id,
            company_id,
            department_id,
            created_by: user_id,
            is_template,
            is_company_prompt,
            tags,
            status: finalStatus,
            version: 1
        }, { transaction });

        // Create initial version
        await PromptVersion.create({
            prompt_id: prompt.id,
            version_number: 1,
            title,
            description,
            content,
            variables,
            created_by: user_id,
            status: finalStatus,
            is_current: true,
            change_notes: 'Initial version'
        }, { transaction });

        // If not draft or is company prompt, create approval request
        if (finalStatus !== 'draft') {
            await PromptApproval.create({
                prompt_id: prompt.id,
                requested_by: user_id,
                request_type: 'new_prompt',
                status: 'pending',
                comments: is_company_prompt ? 'Bedrijfsprompt - wacht op goedkeuring' : null
            }, { transaction });
        }

        await transaction.commit();

        // Return full prompt data
        const fullPrompt = await Prompt.findByPk(prompt.id, {
            include: [
                {
                    model: PromptCategory,
                    as: 'category'
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.status(201).json(fullPrompt);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating prompt:', error);
        res.status(500).json({ error: 'Failed to create prompt' });
    }
};

// Update prompt (creates new version)
exports.updatePrompt = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            title,
            description,
            content,
            variables,
            category_id,
            department_id,
            tags,
            change_notes
        } = req.body;

        const { company_id, id: user_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id
            }
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        // Get current version number
        const lastVersion = await PromptVersion.findOne({
            where: { prompt_id: id },
            order: [['version_number', 'DESC']]
        });

        const newVersionNumber = (lastVersion?.version_number || 0) + 1;

        // Mark all previous versions as not current
        await PromptVersion.update(
            { is_current: false },
            { where: { prompt_id: id }, transaction }
        );

        // Create new version
        await PromptVersion.create({
            prompt_id: id,
            version_number: newVersionNumber,
            title,
            description,
            content,
            variables,
            created_by: user_id,
            status: 'draft',
            is_current: true,
            change_notes
        }, { transaction });

        // Update main prompt record
        await prompt.update({
            title,
            description,
            content,
            variables,
            category_id,
            department_id,
            tags,
            version: newVersionNumber,
            status: 'pending_review'
        }, { transaction });

        // Create approval request for version update
        await PromptApproval.create({
            prompt_id: id,
            requested_by: user_id,
            request_type: 'version_update',
            status: 'pending',
            comments: change_notes
        }, { transaction });

        await transaction.commit();

        res.json({ message: 'Prompt updated successfully', version: newVersionNumber });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating prompt:', error);
        res.status(500).json({ error: 'Failed to update prompt' });
    }
};

// Generate content from prompt with variables
exports.generateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { variables, context } = req.body;
        const { company_id, id: user_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id,
                status: { [Op.ne]: 'archived' } // Allow all non-archived prompts
            }
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        // Replace variables in content
        const generatedContent = replaceVariables(prompt.content, variables);

        // Track usage
        try {
            await PromptUsage.create({
                prompt_id: parseInt(id),
                user_id: user_id,
                version_used: prompt.version || 1,
                variables_data: variables,
                generated_content: generatedContent,
                context: context,
                used_at: new Date()
            });
        } catch (usageError) {
            console.error('Error tracking usage:', usageError);
            // Don't fail the request if usage tracking fails
        }

        // Update prompt usage statistics
        try {
            await prompt.update({
                usage_count: (prompt.usage_count || 0) + 1,
                last_used_at: new Date()
            });
        } catch (updateError) {
            console.error('Error updating usage count:', updateError);
            // Don't fail the request if usage count update fails
        }

        res.json({
            generated_content: generatedContent,
            variables_used: variables,
            prompt_title: prompt.title,
            version: prompt.version
        });
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
};

// Get prompt usage analytics
exports.getPromptAnalytics = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { start_date, end_date, prompt_id } = req.query;

        let where = {
            '$prompt.company_id$': company_id
        };

        if (prompt_id) where.prompt_id = prompt_id;
        if (start_date) where.used_at = { [Op.gte]: new Date(start_date) };
        if (end_date) {
            where.used_at = {
                ...where.used_at,
                [Op.lte]: new Date(end_date)
            };
        }

        const usage = await PromptUsage.findAll({
            where,
            include: [
                {
                    model: Prompt,
                    as: 'prompt',
                    attributes: ['id', 'title', 'category_id'],
                    include: [{
                        model: PromptCategory,
                        as: 'category',
                        attributes: ['name', 'color']
                    }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name']
                }
            ],
            order: [['used_at', 'DESC']]
        });

        res.json(usage);
    } catch (error) {
        console.error('Error fetching prompt analytics:', error);
        res.status(500).json({ error: 'Failed to fetch prompt analytics' });
    }
};

// Delete prompt
exports.deletePrompt = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { company_id, id: user_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id
            }
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        // Check if user can delete this prompt (only creator or admin)
        if (prompt.created_by !== user_id && !['admin', 'super_admin'].includes(req.user.role)) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Not authorized to delete this prompt' });
        }

        // Archive the prompt instead of hard delete
        await prompt.update({
            status: 'archived'
        }, { transaction });

        await transaction.commit();

        res.json({ message: 'Prompt archived successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting prompt:', error);
        res.status(500).json({ error: 'Failed to delete prompt' });
    }
};

// Get approval requests
exports.getApprovalRequests = async (req, res) => {
    try {
        const { company_id } = req.user;
        const { status = 'pending' } = req.query;

        const approvals = await PromptApproval.findAll({
            where: {
                status: status
            },
            include: [
                {
                    model: Prompt,
                    as: 'prompt',
                    where: {
                        company_id: company_id
                    },
                    include: [{
                        model: PromptCategory,
                        as: 'category',
                        attributes: ['name', 'color']
                    }]
                },
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ],
            order: [['requested_at', 'DESC']]
        });

        res.json(approvals);
    } catch (error) {
        console.error('Error fetching approval requests:', error);
        res.status(500).json({ error: 'Failed to fetch approval requests' });
    }
};

// Process approval request
exports.processApproval = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { action, reviewer_comments } = req.body; // action: 'approve', 'reject', 'request_changes'
        const { id: reviewer_id } = req.user;

        const approval = await PromptApproval.findByPk(id, {
            include: [{
                model: Prompt,
                as: 'prompt'
            }]
        });

        if (!approval) {
            return res.status(404).json({ error: 'Approval request not found' });
        }

        // Update approval record
        await approval.update({
            status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes_requested',
            reviewer_id: reviewer_id,
            reviewer_comments: reviewer_comments,
            reviewed_at: new Date()
        }, { transaction });

        // Update prompt status based on action
        if (action === 'approve') {
            await approval.prompt.update({
                status: 'approved'
            }, { transaction });

            // Update current version status if exists
            if (approval.version_id) {
                await PromptVersion.update(
                    { status: 'approved' },
                    { where: { id: approval.version_id }, transaction }
                );
            }
        } else if (action === 'reject') {
            await approval.prompt.update({
                status: 'rejected'
            }, { transaction });
        }

        await transaction.commit();

        res.json({ message: `Approval ${action}ed successfully` });
    } catch (error) {
        await transaction.rollback();
        console.error('Error processing approval:', error);
        res.status(500).json({ error: 'Failed to process approval' });
    }
};

// Get prompt versions
exports.getPromptVersions = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id
            }
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        const versions = await PromptVersion.findAll({
            where: { prompt_id: id },
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }],
            order: [['version_number', 'DESC']]
        });

        res.json(versions);
    } catch (error) {
        console.error('Error fetching prompt versions:', error);
        res.status(500).json({ error: 'Failed to fetch prompt versions' });
    }
};

// Get specific prompt version
exports.getPromptVersion = async (req, res) => {
    try {
        const { id, versionId } = req.params;
        const { company_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id
            }
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        const version = await PromptVersion.findOne({
            where: {
                id: versionId,
                prompt_id: id
            },
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }]
        });

        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        res.json(version);
    } catch (error) {
        console.error('Error fetching prompt version:', error);
        res.status(500).json({ error: 'Failed to fetch prompt version' });
    }
};

// Restore prompt to specific version
exports.restorePromptVersion = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id, versionId } = req.params;
        const { company_id, id: user_id } = req.user;

        const prompt = await Prompt.findOne({
            where: {
                id: id,
                company_id: company_id
            }
        });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        const version = await PromptVersion.findOne({
            where: {
                id: versionId,
                prompt_id: id
            }
        });

        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Mark all versions as not current
        await PromptVersion.update(
            { is_current: false },
            { where: { prompt_id: id }, transaction }
        );

        // Mark selected version as current
        await version.update({ is_current: true }, { transaction });

        // Update main prompt record with version data
        await prompt.update({
            title: version.title,
            description: version.description,
            content: version.content,
            variables: version.variables,
            version: version.version_number,
            status: 'draft' // Reset to draft when restoring
        }, { transaction });

        await transaction.commit();

        res.json({ message: 'Prompt restored to version successfully', version: version.version_number });
    } catch (error) {
        await transaction.rollback();
        console.error('Error restoring prompt version:', error);
        res.status(500).json({ error: 'Failed to restore prompt version' });
    }
};