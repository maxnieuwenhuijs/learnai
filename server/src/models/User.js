const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('participant', 'manager', 'admin', 'super_admin'),
        allowNull: false,
        defaultValue: 'participant'
    },
    oauth_provider: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    oauth_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    oauth_email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    profile_picture_url: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['oauth_provider', 'oauth_id']
        }
    ]
});

// Hash password before creating user
User.beforeCreate(async (user) => {
    if (user.password_hash && !user.password_hash.startsWith('$2')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
});

// Hash password before updating if changed
User.beforeUpdate(async (user) => {
    if (user.changed('password_hash') && !user.password_hash.startsWith('$2')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
});

// Instance method to validate password
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Instance method to get safe user data (without password)
User.prototype.toSafeObject = function() {
    const { password_hash, ...safeUser } = this.toJSON();
    return safeUser;
};

module.exports = User;