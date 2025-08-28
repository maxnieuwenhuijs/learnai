const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper function to generate random date within range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random progress percentage
function randomProgress() {
    return Math.floor(Math.random() * 101);
}

// Helper function to generate quiz score
function randomQuizScore(min = 60, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedComprehensiveData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Starting comprehensive data seeding...\n');

        // Clear existing data in correct order
        console.log('Clearing existing data...');
        await connection.execute('DELETE FROM certificates');
        await connection.execute('DELETE FROM user_progress');
        await connection.execute('DELETE FROM course_assignments');
        await connection.execute('DELETE FROM lessons');
        await connection.execute('DELETE FROM course_modules');
        await connection.execute('DELETE FROM modules');
        await connection.execute('DELETE FROM courses');
        await connection.execute('DELETE FROM users');
        await connection.execute('DELETE FROM departments');
        await connection.execute('DELETE FROM companies');
        console.log('Existing data cleared.\n');

        // ============================================
        // STEP 1: Create Companies
        // ============================================
        console.log('Creating companies...');
        const companies = [
            { name: 'TechCorp Solutions', industry: 'Technology', size: 'large' },
            { name: 'FinanceHub Ltd', industry: 'Financial Services', size: 'medium' },
            { name: 'HealthCare Innovations', industry: 'Healthcare', size: 'large' }
        ];

        const companyIds = [];
        for (const company of companies) {
            const [result] = await connection.execute(
                'INSERT INTO companies (name, created_at) VALUES (?, NOW())',
                [company.name]
            );
            companyIds.push({ id: result.insertId, ...company });
            console.log(`  Created company: ${company.name}`);
        }

        // ============================================
        // STEP 2: Create Departments
        // ============================================
        console.log('\nCreating departments...');
        const departmentTemplates = [
            'Engineering', 'Product Management', 'Data Science', 'HR', 'Legal', 'Operations', 'Sales', 'Marketing'
        ];
        
        const departments = [];
        for (const company of companyIds) {
            // Each company gets 2-3 departments
            const numDepts = Math.floor(Math.random() * 2) + 2;
            const selectedDepts = departmentTemplates.sort(() => 0.5 - Math.random()).slice(0, numDepts);
            
            for (const deptName of selectedDepts) {
                const [result] = await connection.execute(
                    'INSERT INTO departments (company_id, name) VALUES (?, ?)',
                    [company.id, deptName]
                );
                departments.push({
                    id: result.insertId,
                    company_id: company.id,
                    company_name: company.name,
                    name: deptName
                });
                console.log(`  Created department: ${deptName} at ${company.name}`);
            }
        }

        // ============================================
        // STEP 3: Create Users (20+ users)
        // ============================================
        console.log('\nCreating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const userTemplates = [
            // Super Admin (1)
            { email: 'superadmin@platform.com', name: 'Platform Administrator', role: 'super_admin' },
            
            // Company Admins (3)
            { email: 'admin@techcorp.com', name: 'Sarah Johnson', role: 'admin', company: 0 },
            { email: 'admin@financehub.com', name: 'Michael Chen', role: 'admin', company: 1 },
            { email: 'admin@healthcare.com', name: 'Emily Davis', role: 'admin', company: 2 },
            
            // Managers (6)
            { email: 'manager1@techcorp.com', name: 'Robert Wilson', role: 'manager', company: 0, dept: 0 },
            { email: 'manager2@techcorp.com', name: 'Lisa Anderson', role: 'manager', company: 0, dept: 1 },
            { email: 'manager@financehub.com', name: 'David Brown', role: 'manager', company: 1, dept: 0 },
            { email: 'manager2@financehub.com', name: 'Jennifer Lee', role: 'manager', company: 1, dept: 1 },
            { email: 'manager@healthcare.com', name: 'Thomas Miller', role: 'manager', company: 2, dept: 0 },
            { email: 'manager2@healthcare.com', name: 'Amanda Taylor', role: 'manager', company: 2, dept: 1 },
            
            // Participants (15+)
            { email: 'john.doe@techcorp.com', name: 'John Doe', role: 'participant', company: 0, dept: 0 },
            { email: 'jane.smith@techcorp.com', name: 'Jane Smith', role: 'participant', company: 0, dept: 0 },
            { email: 'alex.wong@techcorp.com', name: 'Alex Wong', role: 'participant', company: 0, dept: 1 },
            { email: 'maria.garcia@techcorp.com', name: 'Maria Garcia', role: 'participant', company: 0, dept: 1 },
            { email: 'james.wilson@financehub.com', name: 'James Wilson', role: 'participant', company: 1, dept: 0 },
            { email: 'emma.johnson@financehub.com', name: 'Emma Johnson', role: 'participant', company: 1, dept: 0 },
            { email: 'oliver.brown@financehub.com', name: 'Oliver Brown', role: 'participant', company: 1, dept: 1 },
            { email: 'sophia.davis@financehub.com', name: 'Sophia Davis', role: 'participant', company: 1, dept: 1 },
            { email: 'william.martin@healthcare.com', name: 'William Martin', role: 'participant', company: 2, dept: 0 },
            { email: 'isabella.thompson@healthcare.com', name: 'Isabella Thompson', role: 'participant', company: 2, dept: 0 },
            { email: 'ethan.white@healthcare.com', name: 'Ethan White', role: 'participant', company: 2, dept: 0 },
            { email: 'charlotte.harris@healthcare.com', name: 'Charlotte Harris', role: 'participant', company: 2, dept: 1 },
            { email: 'noah.clark@healthcare.com', name: 'Noah Clark', role: 'participant', company: 2, dept: 1 },
            { email: 'mia.rodriguez@healthcare.com', name: 'Mia Rodriguez', role: 'participant', company: 2, dept: 1 },
            { email: 'lucas.martinez@healthcare.com', name: 'Lucas Martinez', role: 'participant', company: 2, dept: 1 },
            
            // Test accounts (keep existing)
            { email: 'participant@test.com', name: 'Test Participant', role: 'participant', company: 0, dept: 0 },
            { email: 'manager@test.com', name: 'Test Manager', role: 'manager', company: 0, dept: 0 },
            { email: 'admin@test.com', name: 'Test Admin', role: 'admin', company: 0 }
        ];

        const users = [];
        for (const template of userTemplates) {
            // For super_admin or users without company, assign to first company
            const companyId = template.company !== undefined ? companyIds[template.company].id : companyIds[0].id;
            let departmentId = null;
            
            if (template.dept !== undefined && companyId) {
                const companyDepts = departments.filter(d => d.company_id === companyId);
                if (companyDepts[template.dept]) {
                    departmentId = companyDepts[template.dept].id;
                }
            }

            const [result] = await connection.execute(
                'INSERT INTO users (email, name, password_hash, role, company_id, department_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [template.email, template.name, hashedPassword, template.role, companyId, departmentId]
            );
            users.push({
                id: result.insertId,
                ...template,
                company_id: companyId,
                department_id: departmentId
            });
            console.log(`  Created user: ${template.email} (${template.role})`);
        }

        // ============================================
        // STEP 4: Create EU AI Act Compliance Courses
        // ============================================
        console.log('\nCreating EU AI Act compliance courses...');
        
        const courses = [
            {
                title: 'EU AI Act Fundamentals',
                description: 'Comprehensive introduction to the EU AI Act regulations, covering key concepts, risk categories, and compliance requirements.',
                target_role: 'all',
                difficulty: 'beginner',
                duration_hours: 4
            },
            {
                title: 'Risk Assessment for AI Systems',
                description: 'Deep dive into AI risk assessment methodologies, categorization frameworks, and mitigation strategies as per EU AI Act.',
                target_role: 'manager',
                difficulty: 'intermediate',
                duration_hours: 6
            },
            {
                title: 'Technical Requirements for High-Risk AI',
                description: 'Technical specifications and requirements for developing and deploying high-risk AI systems under EU regulations.',
                target_role: 'all',
                difficulty: 'advanced',
                duration_hours: 8
            },
            {
                title: 'Data Governance and AI Ethics',
                description: 'Best practices for data governance, privacy protection, and ethical AI development in compliance with EU standards.',
                target_role: 'all',
                difficulty: 'intermediate',
                duration_hours: 5
            },
            {
                title: 'AI Act Compliance for Healthcare',
                description: 'Specialized course focusing on EU AI Act implications for healthcare AI applications and medical devices.',
                target_role: 'all',
                difficulty: 'advanced',
                duration_hours: 7
            },
            {
                title: 'Financial Services AI Compliance',
                description: 'Understanding EU AI Act requirements specific to financial services, including credit scoring and risk assessment.',
                target_role: 'all',
                difficulty: 'intermediate',
                duration_hours: 6
            }
        ];

        const courseIds = [];
        for (const course of courses) {
            const [result] = await connection.execute(
                'INSERT INTO courses (title, description, target_role) VALUES (?, ?, ?)',
                [course.title, course.description, course.target_role]
            );
            courseIds.push({ id: result.insertId, ...course });
            console.log(`  Created course: ${course.title}`);
        }

        // ============================================
        // STEP 5: Create Modules and Lessons
        // ============================================
        console.log('\nCreating modules and lessons...');
        
        const moduleTemplates = {
            'EU AI Act Fundamentals': [
                {
                    title: 'Introduction to AI Regulation',
                    description: 'Overview of global AI regulation landscape',
                    duration: 45,
                    lessons: [
                        { title: 'Welcome to EU AI Act', type: 'video', duration: 10 },
                        { title: 'History and Context', type: 'text', duration: 15 },
                        { title: 'Global AI Regulations Overview', type: 'video', duration: 20 },
                        { title: 'Knowledge Check', type: 'quiz', questions: 10 }
                    ]
                },
                {
                    title: 'Understanding Risk Categories',
                    description: 'Classification of AI systems by risk level',
                    duration: 60,
                    lessons: [
                        { title: 'Risk-Based Approach', type: 'video', duration: 15 },
                        { title: 'Prohibited AI Systems', type: 'text', duration: 10 },
                        { title: 'High-Risk AI Systems', type: 'text', duration: 15 },
                        { title: 'Limited and Minimal Risk Systems', type: 'video', duration: 20 },
                        { title: 'Risk Assessment Quiz', type: 'quiz', questions: 15 }
                    ]
                },
                {
                    title: 'Compliance Requirements',
                    description: 'Key compliance obligations under EU AI Act',
                    duration: 75,
                    lessons: [
                        { title: 'Compliance Framework Overview', type: 'video', duration: 25 },
                        { title: 'Documentation Requirements', type: 'text', duration: 20 },
                        { title: 'Testing and Validation', type: 'lab_simulation', duration: 30 },
                        { title: 'Final Assessment', type: 'quiz', questions: 20 }
                    ]
                }
            ],
            'Risk Assessment for AI Systems': [
                {
                    title: 'Risk Assessment Fundamentals',
                    description: 'Core concepts of AI risk assessment',
                    duration: 90,
                    lessons: [
                        { title: 'Introduction to Risk Assessment', type: 'video', duration: 20 },
                        { title: 'Risk Identification Methods', type: 'text', duration: 30 },
                        { title: 'Risk Analysis Framework', type: 'video', duration: 25 },
                        { title: 'Practical Exercise', type: 'lab_simulation', duration: 40 },
                        { title: 'Assessment Quiz', type: 'quiz', questions: 15 }
                    ]
                },
                {
                    title: 'Advanced Risk Mitigation',
                    description: 'Strategies for mitigating AI risks',
                    duration: 120,
                    lessons: [
                        { title: 'Mitigation Strategies', type: 'video', duration: 30 },
                        { title: 'Technical Safeguards', type: 'text', duration: 25 },
                        { title: 'Organizational Measures', type: 'text', duration: 20 },
                        { title: 'Case Study Analysis', type: 'lab_simulation', duration: 45 },
                        { title: 'Final Exam', type: 'quiz', questions: 25 }
                    ]
                }
            ]
        };

        // Create modules and lessons for each course
        for (const course of courseIds.slice(0, 2)) { // Only create detailed modules for first 2 courses
            const courseModules = moduleTemplates[course.title] || [];
            
            for (let modIndex = 0; modIndex < courseModules.length; modIndex++) {
                const moduleTemplate = courseModules[modIndex];
                
                // Create module
                const [moduleResult] = await connection.execute(
                    'INSERT INTO modules (title, description, estimated_duration_minutes) VALUES (?, ?, ?)',
                    [moduleTemplate.title, moduleTemplate.description, moduleTemplate.duration]
                );
                
                // Link module to course
                await connection.execute(
                    'INSERT INTO course_modules (course_id, module_id, module_order) VALUES (?, ?, ?)',
                    [course.id, moduleResult.insertId, modIndex + 1]
                );
                
                console.log(`    Added module: ${moduleTemplate.title} to ${course.title}`);
                
                // Create lessons for module
                for (let lessonIndex = 0; lessonIndex < moduleTemplate.lessons.length; lessonIndex++) {
                    const lesson = moduleTemplate.lessons[lessonIndex];
                    
                    let contentData = {
                        duration: (lesson.duration || 10) * 60, // Convert minutes to seconds
                    };
                    
                    if (lesson.type === 'video') {
                        contentData.url = `https://example.com/videos/lesson-${moduleResult.insertId}-${lessonIndex + 1}.mp4`;
                    } else if (lesson.type === 'text') {
                        contentData.content = `
# ${lesson.title}

## Introduction
This lesson covers important aspects of EU AI Act compliance. Understanding these concepts is crucial for ensuring your AI systems meet regulatory requirements.

## Key Concepts
1. **Risk-based approach**: The EU AI Act categorizes AI systems based on their potential impact
2. **Transparency requirements**: Users must be informed when interacting with AI systems
3. **Human oversight**: High-risk AI systems require meaningful human review
4. **Data governance**: Proper data handling and quality management is essential

## Practical Applications
- Implementing compliance checks in your development process
- Creating documentation that meets regulatory standards
- Establishing monitoring and audit procedures

## Summary
Compliance with the EU AI Act requires a comprehensive approach that addresses technical, organizational, and procedural aspects of AI system development and deployment.
                        `;
                    } else if (lesson.type === 'quiz') {
                        const questions = [];
                        for (let q = 1; q <= (lesson.questions || 5); q++) {
                            questions.push({
                                question: `Question ${q}: What is a key requirement of the EU AI Act?`,
                                options: [
                                    'Transparency in AI operations',
                                    'Maximum processing speed',
                                    'Minimal documentation',
                                    'No human oversight needed'
                                ],
                                correct: 0,
                                explanation: 'Transparency is a fundamental requirement of the EU AI Act to ensure users understand when they are interacting with AI systems.'
                            });
                        }
                        contentData.questions = questions;
                    } else if (lesson.type === 'lab_simulation') {
                        contentData.simulationType = 'risk_assessment';
                        contentData.instructions = 'Complete the risk assessment simulation for the given AI system scenario.';
                        contentData.scenario = 'You are evaluating an AI system used for automated resume screening...';
                    }
                    
                    await connection.execute(
                        'INSERT INTO lessons (module_id, title, content_type, content_data, lesson_order) VALUES (?, ?, ?, ?, ?)',
                        [moduleResult.insertId, lesson.title, lesson.type, JSON.stringify(contentData), lessonIndex + 1]
                    );
                }
                console.log(`      Created ${moduleTemplate.lessons.length} lessons`);
            }
        }

        // Create simplified modules for remaining courses
        for (const course of courseIds.slice(2)) {
            for (let i = 1; i <= 2; i++) {
                const [moduleResult] = await connection.execute(
                    'INSERT INTO modules (title, description, estimated_duration_minutes) VALUES (?, ?, ?)',
                    [`Module ${i}: ${course.title}`, `Core concepts for ${course.title}`, 60]
                );
                
                await connection.execute(
                    'INSERT INTO course_modules (course_id, module_id, module_order) VALUES (?, ?, ?)',
                    [course.id, moduleResult.insertId, i]
                );
                
                // Add 3 lessons per module
                for (let j = 1; j <= 3; j++) {
                    const contentTypes = ['video', 'text', 'quiz'];
                    const contentType = contentTypes[j - 1];
                    const contentData = {
                        duration: 600,
                        content: contentType === 'text' ? 'Sample content for this lesson...' : null,
                        url: contentType === 'video' ? 'https://example.com/video.mp4' : null,
                        questions: contentType === 'quiz' ? [
                            {
                                question: 'Sample question?',
                                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                correct: 0
                            }
                        ] : null
                    };
                    
                    await connection.execute(
                        'INSERT INTO lessons (module_id, title, content_type, content_data, lesson_order) VALUES (?, ?, ?, ?, ?)',
                        [moduleResult.insertId, `Lesson ${j}`, contentType, JSON.stringify(contentData), j]
                    );
                }
            }
            console.log(`    Added 2 modules to ${course.title}`);
        }

        // ============================================
        // STEP 6: Create Course Assignments
        // ============================================
        console.log('\nAssigning courses to companies and departments...');
        
        // Assign courses to companies
        for (const company of companyIds) {
            // Each company gets 3-4 courses
            const numCourses = Math.floor(Math.random() * 2) + 3;
            const selectedCourses = courseIds.sort(() => 0.5 - Math.random()).slice(0, numCourses);
            
            for (const course of selectedCourses) {
                // Assign to entire company
                await connection.execute(
                    'INSERT INTO course_assignments (course_id, company_id, department_id, assigned_at) VALUES (?, ?, NULL, NOW())',
                    [course.id, company.id]
                );
                console.log(`  Assigned "${course.title}" to ${company.name}`);
                
                // Also assign some courses to specific departments
                if (Math.random() > 0.5) {
                    const companyDepts = departments.filter(d => d.company_id === company.id);
                    if (companyDepts.length > 0) {
                        const dept = companyDepts[Math.floor(Math.random() * companyDepts.length)];
                        await connection.execute(
                            'INSERT INTO course_assignments (course_id, company_id, department_id, assigned_at) VALUES (?, ?, ?, NOW())',
                            [course.id, company.id, dept.id]
                        );
                        console.log(`    Also assigned to ${dept.name} department`);
                    }
                }
            }
        }

        // ============================================
        // STEP 7: Create User Progress Records
        // ============================================
        console.log('\nCreating user progress records...');
        
        // Get all lessons for progress tracking
        const [allLessons] = await connection.execute(`
            SELECT l.*, m.title as module_title, c.title as course_title, c.id as course_id
            FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN course_modules cm ON m.id = cm.module_id
            JOIN courses c ON cm.course_id = c.id
            ORDER BY c.id, cm.module_order, l.lesson_order
        `);

        // Create progress for participants
        const participants = users.filter(u => u.role === 'participant');
        for (const user of participants) {
            // Each participant has progress in 1-3 courses
            const userCourseIds = [...new Set(allLessons.map(l => l.course_id))]
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 3) + 1);
            
            for (const courseId of userCourseIds) {
                const courseLessons = allLessons.filter(l => l.course_id === courseId);
                const completionRate = Math.random(); // 0 to 1
                const numLessonsToComplete = Math.floor(courseLessons.length * completionRate);
                
                for (let i = 0; i < courseLessons.length; i++) {
                    const lesson = courseLessons[i];
                    let status = 'not_started';
                    let startedAt = null;
                    let completedAt = null;
                    let timeSpent = 0;
                    let quizScore = null;
                    
                    if (i < numLessonsToComplete) {
                        status = 'completed';
                        const daysAgo = Math.floor(Math.random() * 30) + 1;
                        startedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
                        completedAt = new Date(startedAt.getTime() + Math.floor(Math.random() * 3600000)); // Up to 1 hour later
                        timeSpent = Math.floor((completedAt - startedAt) / 1000);
                        
                        // Add quiz score for quiz lessons
                        if (lesson.content_type === 'quiz') {
                            quizScore = randomQuizScore(65, 100);
                        }
                    } else if (i === numLessonsToComplete && completionRate < 1) {
                        status = 'in_progress';
                        const daysAgo = Math.floor(Math.random() * 7) + 1;
                        startedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
                        timeSpent = Math.floor(Math.random() * 1800); // Up to 30 minutes
                    }
                    
                    if (status !== 'not_started') {
                        await connection.execute(
                            'INSERT INTO user_progress (user_id, lesson_id, status, started_at, completed_at, time_spent_seconds, quiz_score, last_accessed_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                            [user.id, lesson.id, status, startedAt, completedAt, timeSpent, quizScore]
                        );
                    }
                }
                
                const completionPercentage = Math.floor(completionRate * 100);
                console.log(`  ${user.name}: ${completionPercentage}% complete in "${courseLessons[0].course_title}"`);
            }
        }

        // ============================================
        // STEP 8: Create Certificates for Completed Courses
        // ============================================
        console.log('\nGenerating certificates for completed courses...');
        
        // Find users who completed all lessons in a course
        const [completions] = await connection.execute(`
            SELECT 
                up.user_id,
                c.id as course_id,
                c.title as course_title,
                u.name as user_name,
                COUNT(DISTINCT l.id) as completed_lessons,
                (SELECT COUNT(*) FROM lessons l2 
                 JOIN modules m2 ON l2.module_id = m2.id 
                 JOIN course_modules cm2 ON m2.id = cm2.module_id 
                 WHERE cm2.course_id = c.id) as total_lessons,
                MAX(up.completed_at) as completion_date
            FROM user_progress up
            JOIN lessons l ON up.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            JOIN course_modules cm ON m.id = cm.module_id
            JOIN courses c ON cm.course_id = c.id
            JOIN users u ON up.user_id = u.id
            WHERE up.status = 'completed'
            GROUP BY up.user_id, c.id
            HAVING completed_lessons = total_lessons
        `);

        for (const completion of completions) {
            const certificateId = Math.random().toString(36).substring(2, 15).toUpperCase();
            await connection.execute(
                'INSERT INTO certificates (user_id, course_id, certificate_id, issued_date, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    completion.user_id,
                    completion.course_id,
                    `CERT-${certificateId}`,
                    completion.completion_date,
                    new Date(new Date(completion.completion_date).getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
                    'active'
                ]
            );
            console.log(`  Certificate issued to ${completion.user_name} for "${completion.course_title}"`);
        }

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n========================================');
        console.log('COMPREHENSIVE DATA SEEDING COMPLETE!');
        console.log('========================================');
        console.log('\nSummary:');
        console.log(`  - ${companyIds.length} companies`);
        console.log(`  - ${departments.length} departments`);
        console.log(`  - ${users.length} users (all roles)`);
        console.log(`  - ${courseIds.length} EU AI Act compliance courses`);
        console.log(`  - Multiple modules and lessons per course`);
        console.log(`  - Progress tracking for all participants`);
        console.log(`  - Certificates for completed courses`);
        
        console.log('\n========================================');
        console.log('TEST ACCOUNTS (password: password123)');
        console.log('========================================');
        console.log('Super Admin:  superadmin@platform.com');
        console.log('Admin:        admin@test.com');
        console.log('Manager:      manager@test.com');
        console.log('Participant:  participant@test.com');
        console.log('\nCompany Admins:');
        console.log('  admin@techcorp.com');
        console.log('  admin@financehub.com');
        console.log('  admin@healthcare.com');
        console.log('\nSample Participants:');
        console.log('  john.doe@techcorp.com');
        console.log('  emma.johnson@financehub.com');
        console.log('  william.martin@healthcare.com');
        console.log('========================================\n');

    } catch (error) {
        console.error('Error seeding data:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the seeding script
seedComprehensiveData();