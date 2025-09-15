const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-z0-9-]+$/i,
            len: [2, 50]
        },
        comment: 'URL-friendly company identifier for subdomain (e.g., marktplaats for marktplaats.h2ww.ai)'
    },
    industry: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Netherlands'
    },
    size: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'trial', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'trial'
    },
    subscription_type: {
        type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
        allowNull: false,
        defaultValue: 'free'
    },
    max_users: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10
    },
    logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL path to company logo file'
    },
    logo_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Original filename of the uploaded logo'
    }
}, {
    tableName: 'companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Helper function to generate slug from company name
Company.generateSlug = function(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); // Remove leading/trailing hyphens
};

// Hook to auto-generate slug if not provided
Company.beforeValidate((company, options) => {
    if (!company.slug && company.name) {
        company.slug = Company.generateSlug(company.name);
    }
});

module.exports = Company;