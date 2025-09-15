const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Ensure upload directories exist
const ensureUploadDirs = async () => {
    const dirs = [
        'uploads',
        'uploads/company-logos',
        'uploads/company-logos/thumbnails'
    ];

    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            console.error(`Error creating directory ${dir}:`, error);
        }
    }
};

// Initialize upload directories
ensureUploadDirs();

// Configure multer for memory storage (we'll process images before saving)
const storage = multer.memoryStorage();

// File filter for images only
const imageFilter = (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
    }

    // Check for supported formats
    const allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFormats.includes(file.mimetype)) {
        return cb(new Error('Unsupported image format. Please use JPEG, PNG, GIF, or WebP'), false);
    }

    cb(null, true);
};

// Configure multer for company logo uploads
const companyLogoUpload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file at a time
    }
});

// Process and save company logo
const processCompanyLogo = async (buffer, originalName, companyId) => {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const hash = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(originalName).toLowerCase();
        const filename = `company-${companyId}-${timestamp}-${hash}${ext}`;

        // Define paths
        const logoPath = path.join('uploads', 'company-logos', filename);
        const thumbnailPath = path.join('uploads', 'company-logos', 'thumbnails', `thumb-${filename}`);

        // Process main logo (resize to max 800x600, maintain aspect ratio)
        const processedImage = await sharp(buffer)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        // Create thumbnail (200x150)
        const thumbnailImage = await sharp(buffer)
            .resize(200, 150, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Save files
        await fs.writeFile(logoPath, processedImage);
        await fs.writeFile(thumbnailPath, thumbnailImage);

        // Get image metadata
        const metadata = await sharp(processedImage).metadata();

        return {
            filename: filename,
            path: logoPath,
            thumbnailPath: thumbnailPath,
            url: `/uploads/company-logos/${filename}`,
            thumbnailUrl: `/uploads/company-logos/thumbnails/thumb-${filename}`,
            size: processedImage.length,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
        };
    } catch (error) {
        console.error('Error processing company logo:', error);
        throw new Error('Failed to process logo image');
    }
};

// Delete company logo files
const deleteCompanyLogo = async (logoUrl) => {
    try {
        if (!logoUrl) return;

        // Extract filename from URL
        const filename = path.basename(logoUrl);
        const logoPath = path.join('uploads', 'company-logos', filename);
        const thumbnailPath = path.join('uploads', 'company-logos', 'thumbnails', `thumb-${filename}`);

        // Delete files if they exist
        try {
            await fs.unlink(logoPath);
        } catch (error) {
            console.log('Logo file not found:', logoPath);
        }

        try {
            await fs.unlink(thumbnailPath);
        } catch (error) {
            console.log('Thumbnail file not found:', thumbnailPath);
        }

        return true;
    } catch (error) {
        console.error('Error deleting company logo:', error);
        return false;
    }
};

// Validate image dimensions and resolution
const validateImageSpecs = async (buffer) => {
    try {
        const metadata = await sharp(buffer).metadata();

        const specs = {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: buffer.length
        };

        // Recommended specs for company logos
        const recommendations = [];

        if (specs.width < 200 || specs.height < 150) {
            recommendations.push('Image should be at least 200x150 pixels for best quality');
        }

        if (specs.width > 2000 || specs.height > 2000) {
            recommendations.push('Image will be resized to maximum 800x600 pixels');
        }

        const aspectRatio = specs.width / specs.height;
        if (aspectRatio < 0.8 || aspectRatio > 2.0) {
            recommendations.push('Consider using an image with aspect ratio between 4:5 and 2:1 for best display');
        }

        return {
            valid: true,
            specs,
            recommendations
        };
    } catch (error) {
        return {
            valid: false,
            error: 'Invalid image file'
        };
    }
};

// Get file size in human readable format
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
    companyLogoUpload,
    processCompanyLogo,
    deleteCompanyLogo,
    validateImageSpecs,
    formatFileSize
};
