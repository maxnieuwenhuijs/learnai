const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const ContentUpload = sequelize.define('ContentUpload', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'courses',
            key: 'id'
        },
        comment: 'Associated course'
    },
    module_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'modules',
            key: 'id'
        },
        comment: 'Associated module'
    },
    lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'lessons',
            key: 'id'
        },
        comment: 'Associated lesson'
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Original file name'
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Storage path or URL'
    },
    file_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'MIME type of the file'
    },
    file_extension: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'File extension'
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'File size in bytes'
    },
    content_type: {
        type: DataTypes.ENUM('video', 'document', 'presentation', 'image', 'audio', 'archive', 'other'),
        allowNull: false,
        defaultValue: 'other'
    },
    storage_type: {
        type: DataTypes.ENUM('local', 's3', 'azure', 'gcs', 'url'),
        allowNull: false,
        defaultValue: 'local',
        comment: 'Storage location type'
    },
    cdn_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'CDN URL if available'
    },
    thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Thumbnail for videos and images'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duration in seconds (for videos/audio)'
    },
    resolution: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Resolution for videos (e.g., 1920x1080)'
    },
    encoding: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Video/audio encoding format'
    },
    pages: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Number of pages (for documents)'
    },
    transcription_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL to transcription file (for videos/audio)'
    },
    subtitles_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL to subtitles file (for videos)'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional metadata (dimensions, bitrate, etc.)'
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Tags for categorization and search'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of the content'
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    access_level: {
        type: DataTypes.ENUM('public', 'registered', 'enrolled', 'restricted'),
        allowNull: false,
        defaultValue: 'enrolled',
        comment: 'Who can access this content'
    },
    download_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    processing_status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'completed',
        comment: 'Processing status for video transcoding, etc.'
    },
    processing_error: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Error message if processing failed'
    },
    checksum: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'File checksum for integrity verification'
    },
    virus_scan_status: {
        type: DataTypes.ENUM('pending', 'clean', 'infected', 'error'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Virus scan status'
    },
    virus_scan_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this content expires and should be removed'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'content_uploads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['course_id']
        },
        {
            fields: ['module_id']
        },
        {
            fields: ['lesson_id']
        },
        {
            fields: ['uploaded_by']
        },
        {
            fields: ['content_type']
        },
        {
            fields: ['file_type']
        },
        {
            fields: ['is_active', 'access_level']
        },
        {
            unique: true,
            fields: ['checksum'],
            where: {
                checksum: {
                    [Op.ne]: null
                }
            }
        }
    ]
});

// Instance method to get formatted file size
ContentUpload.prototype.getFormattedSize = function() {
    const bytes = this.file_size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Instance method to increment view count
ContentUpload.prototype.incrementViewCount = async function() {
    this.view_count += 1;
    await this.save();
    return this.view_count;
};

// Instance method to increment download count
ContentUpload.prototype.incrementDownloadCount = async function() {
    this.download_count += 1;
    await this.save();
    return this.download_count;
};

// Instance method to check if file is expired
ContentUpload.prototype.isExpired = function() {
    if (!this.expiry_date) return false;
    return new Date() > new Date(this.expiry_date);
};

// Class method to get content by type
ContentUpload.getContentByType = async function(contentType, courseId = null) {
    const where = {
        content_type: contentType,
        is_active: true,
        virus_scan_status: 'clean'
    };
    
    if (courseId) {
        where.course_id = courseId;
    }
    
    return await this.findAll({
        where,
        order: [['created_at', 'DESC']]
    });
};

// Class method to clean up expired content
ContentUpload.cleanupExpiredContent = async function() {
    const now = new Date();
    
    const expiredContent = await this.findAll({
        where: {
            expiry_date: {
                [sequelize.Op.lt]: now
            },
            is_active: true
        }
    });
    
    for (const content of expiredContent) {
        content.is_active = false;
        await content.save();
        // Here you would also delete the actual file from storage
    }
    
    return expiredContent.length;
};

// Class method to get total storage used
ContentUpload.getTotalStorageUsed = async function(companyId = null) {
    const where = { is_active: true };
    
    if (companyId) {
        // Would need to join with courses table to filter by company
        // This is a simplified version
    }
    
    const result = await this.sum('file_size', { where });
    return result || 0;
};

module.exports = ContentUpload;