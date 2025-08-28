const { Certificate, User, Course, Module, Lesson, UserProgress, CourseModule } = require('../../models');
const { Op } = require('sequelize');
const certificateService = require('../../services/certificate.service');
const { v4: uuidv4 } = require('uuid');

// Get all certificates for the authenticated user
const getUserCertificates = async (req, res) => {
    try {
        const userId = req.user.id;

        const certificates = await Certificate.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'target_role']
                }
            ],
            order: [['issued_at', 'DESC']]
        });

        const formattedCertificates = certificates.map(cert => ({
            id: cert.id,
            certificateUid: cert.certificate_uid,
            issuedAt: cert.issued_at,
            course: {
                id: cert.course.id,
                title: cert.course.title,
                description: cert.course.description,
                targetRole: cert.course.target_role
            }
        }));

        res.json({
            success: true,
            certificates: formattedCertificates
        });
    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching certificates'
        });
    }
};

// Get a specific certificate by ID
const getCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const certificate = await Certificate.findOne({
            where: { 
                id,
                user_id: userId 
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'target_role']
                }
            ]
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        const formattedCertificate = {
            id: certificate.id,
            certificateUid: certificate.certificate_uid,
            issuedAt: certificate.issued_at,
            user: {
                name: certificate.user.name,
                email: certificate.user.email
            },
            course: {
                id: certificate.course.id,
                title: certificate.course.title,
                description: certificate.course.description,
                targetRole: certificate.course.target_role
            },
            verificationUrl: `${req.protocol}://${req.get('host')}/api/certificates/verify/${certificate.certificate_uid}`
        };

        res.json({
            success: true,
            certificate: formattedCertificate
        });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching certificate'
        });
    }
};

// Generate a certificate after course completion
const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
            where: {
                user_id: userId,
                course_id: courseId
            }
        });

        if (existingCertificate) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already exists for this course',
                certificate: {
                    id: existingCertificate.id,
                    certificateUid: existingCertificate.certificate_uid,
                    issuedAt: existingCertificate.issued_at
                }
            });
        }

        // Check if course exists
        const course = await Course.findByPk(courseId, {
            include: [{
                model: Module,
                as: 'modules',
                through: { attributes: ['module_order'] },
                include: [{
                    model: Lesson,
                    as: 'lessons'
                }]
            }]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get all lesson IDs for this course
        const lessonIds = [];
        course.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                lessonIds.push(lesson.id);
            });
        });

        if (lessonIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course has no lessons'
            });
        }

        // Check if user has completed all lessons
        const completedLessonsCount = await UserProgress.count({
            where: {
                user_id: userId,
                lesson_id: { [Op.in]: lessonIds },
                status: 'completed'
            }
        });

        if (completedLessonsCount < lessonIds.length) {
            const completionPercentage = Math.round((completedLessonsCount / lessonIds.length) * 100);
            return res.status(400).json({
                success: false,
                message: 'Course not completed',
                details: {
                    totalLessons: lessonIds.length,
                    completedLessons: completedLessonsCount,
                    completionPercentage
                }
            });
        }

        // Generate unique certificate UID
        const certificateUid = uuidv4();

        // Create certificate
        const certificate = await Certificate.create({
            user_id: userId,
            course_id: courseId,
            certificate_uid: certificateUid
        });

        // Get user details for response
        const user = await User.findByPk(userId, {
            attributes: ['name', 'email']
        });

        const formattedCertificate = {
            id: certificate.id,
            certificateUid: certificate.certificate_uid,
            issuedAt: certificate.issued_at,
            user: {
                name: user.name,
                email: user.email
            },
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                targetRole: course.target_role
            },
            verificationUrl: `${req.protocol}://${req.get('host')}/api/certificates/verify/${certificate.certificate_uid}`
        };

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            certificate: formattedCertificate
        });
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating certificate'
        });
    }
};

// Verify certificate authenticity by verification code
const verifyCertificate = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Verification code is required'
            });
        }

        const certificate = await Certificate.findOne({
            where: { certificate_uid: code },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['title', 'description', 'target_role']
                }
            ]
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Invalid certificate code',
                valid: false
            });
        }

        const verificationResult = {
            valid: true,
            certificateDetails: {
                certificateUid: certificate.certificate_uid,
                issuedAt: certificate.issued_at,
                recipient: {
                    name: certificate.user.name,
                    email: certificate.user.email
                },
                course: {
                    title: certificate.course.title,
                    description: certificate.course.description,
                    targetRole: certificate.course.target_role
                }
            },
            message: 'This is a valid certificate issued by the E-Learning Platform for EU AI Act Compliance'
        };

        res.json({
            success: true,
            ...verificationResult
        });
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error verifying certificate'
        });
    }
};

// Download certificate as PDF
const downloadCertificatePDF = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const certificate = await Certificate.findOne({
            where: { 
                id,
                user_id: userId 
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['title', 'description', 'target_role']
                }
            ]
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Generate PDF using the certificate service
        const pdfBuffer = await certificateService.generateCertificatePDF({
            certificateUid: certificate.certificate_uid,
            recipientName: certificate.user.name,
            courseTitle: certificate.course.title,
            courseDescription: certificate.course.description,
            issuedDate: certificate.issued_at,
            verificationUrl: `${req.protocol}://${req.get('host')}/api/certificates/verify/${certificate.certificate_uid}`
        });

        // Set response headers for PDF download
        const fileName = `certificate-${certificate.certificate_uid}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Download certificate PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating certificate PDF'
        });
    }
};

module.exports = {
    getUserCertificates,
    getCertificate,
    generateCertificate,
    verifyCertificate,
    downloadCertificatePDF
};