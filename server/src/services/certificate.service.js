const PDFDocument = require('pdfkit');

class CertificateService {
    async generateCertificatePDF(certificateData) {
        return new Promise((resolve, reject) => {
            try {
                // Create a new PDF document
                const doc = new PDFDocument({
                    size: 'A4',
                    layout: 'landscape',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });

                // Collect PDF data chunks
                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Add border
                doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
                   .stroke('#3B82F6');

                // Add inner border
                doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
                   .stroke('#3B82F6');

                // Add header image/logo placeholder
                const logoY = 70;
                doc.fontSize(24)
                   .fillColor('#1E40AF')
                   .text('E-Learning Platform', 0, logoY, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add subtitle
                doc.fontSize(14)
                   .fillColor('#64748B')
                   .text('EU AI Act Compliance Training', 0, logoY + 35, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add certificate title
                doc.fontSize(40)
                   .fillColor('#1F2937')
                   .text('Certificate of Completion', 0, 180, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add recipient section
                doc.fontSize(16)
                   .fillColor('#64748B')
                   .text('This certifies that', 0, 260, {
                       align: 'center',
                       width: doc.page.width
                   });

                doc.fontSize(28)
                   .fillColor('#1E40AF')
                   .text(certificateData.recipientName, 0, 290, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add course completion text
                doc.fontSize(16)
                   .fillColor('#64748B')
                   .text('has successfully completed the course', 0, 340, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add course title
                doc.fontSize(24)
                   .fillColor('#1F2937')
                   .text(certificateData.courseTitle, 0, 370, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add course description if available
                if (certificateData.courseDescription) {
                    doc.fontSize(12)
                       .fillColor('#64748B')
                       .text(certificateData.courseDescription, 100, 410, {
                           align: 'center',
                           width: doc.page.width - 200
                       });
                }

                // Add issue date
                const issueDate = new Date(certificateData.issuedDate);
                const formattedDate = issueDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                doc.fontSize(14)
                   .fillColor('#64748B')
                   .text(`Issued on ${formattedDate}`, 0, 460, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Add signature placeholder sections
                const signatureY = 500;
                const signatureWidth = 200;
                const leftSignatureX = 150;
                const rightSignatureX = doc.page.width - leftSignatureX - signatureWidth;

                // Left signature line
                doc.moveTo(leftSignatureX, signatureY)
                   .lineTo(leftSignatureX + signatureWidth, signatureY)
                   .stroke('#CBD5E1');

                doc.fontSize(12)
                   .fillColor('#64748B')
                   .text('Platform Administrator', leftSignatureX, signatureY + 10, {
                       width: signatureWidth,
                       align: 'center'
                   });

                // Right signature line
                doc.moveTo(rightSignatureX, signatureY)
                   .lineTo(rightSignatureX + signatureWidth, signatureY)
                   .stroke('#CBD5E1');

                doc.fontSize(12)
                   .fillColor('#64748B')
                   .text('Training Director', rightSignatureX, signatureY + 10, {
                       width: signatureWidth,
                       align: 'center'
                   });

                // Add verification footer
                const footerY = doc.page.height - 80;
                
                // Certificate ID
                doc.fontSize(10)
                   .fillColor('#94A3B8')
                   .text(`Certificate ID: ${certificateData.certificateUid}`, 0, footerY, {
                       align: 'center',
                       width: doc.page.width
                   });

                // Verification URL
                if (certificateData.verificationUrl) {
                    doc.fontSize(10)
                       .fillColor('#3B82F6')
                       .text('Verify this certificate at:', 0, footerY + 15, {
                           align: 'center',
                           width: doc.page.width
                       });

                    doc.fontSize(9)
                       .fillColor('#3B82F6')
                       .text(certificateData.verificationUrl, 0, footerY + 28, {
                           align: 'center',
                           width: doc.page.width,
                           underline: true
                       });
                }

                // Finalize the PDF
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    generateVerificationQRCode(certificateUid) {
        // This could be enhanced with actual QR code generation
        // using a library like qrcode if needed
        // For now, returning the verification URL is sufficient
        return `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificateUid}`;
    }

    async validateCertificateData(data) {
        const required = ['recipientName', 'courseTitle', 'certificateUid', 'issuedDate'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        return true;
    }

    formatCertificateNumber(certificateId, issuedDate) {
        const year = new Date(issuedDate).getFullYear();
        const paddedId = String(certificateId).padStart(6, '0');
        return `CERT-${year}-${paddedId}`;
    }

    calculateExpiryDate(issuedDate, validityMonths = 24) {
        const issued = new Date(issuedDate);
        const expiry = new Date(issued);
        expiry.setMonth(expiry.getMonth() + validityMonths);
        return expiry;
    }
}

module.exports = new CertificateService();