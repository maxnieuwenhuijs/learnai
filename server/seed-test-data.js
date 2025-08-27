const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedTestData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('🌱 Starting to seed test data...');

        // Create test company
        const [companyResult] = await connection.execute(
            'INSERT INTO companies (name, created_at) VALUES (?, NOW())',
            ['Test Company Inc']
        );
        const companyId = companyResult.insertId;
        console.log('✅ Created test company:', companyId);

        // Create test departments
        const [hrDept] = await connection.execute(
            'INSERT INTO departments (company_id, name) VALUES (?, ?)',
            [companyId, 'Human Resources']
        );
        const [techDept] = await connection.execute(
            'INSERT INTO departments (company_id, name) VALUES (?, ?)',
            [companyId, 'Technology']
        );
        console.log('✅ Created test departments');

        // Hash passwords
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create test users
        const users = [
            {
                email: 'admin@test.com',
                name: 'Admin User',
                password: hashedPassword,
                role: 'admin',
                company_id: companyId,
                department_id: null
            },
            {
                email: 'manager@test.com',
                name: 'Manager User',
                password: hashedPassword,
                role: 'manager',
                company_id: companyId,
                department_id: hrDept.insertId
            },
            {
                email: 'participant@test.com',
                name: 'Test Participant',
                password: hashedPassword,
                role: 'participant',
                company_id: companyId,
                department_id: techDept.insertId
            },
            {
                email: 'john@test.com',
                name: 'John Doe',
                password: hashedPassword,
                role: 'participant',
                company_id: companyId,
                department_id: techDept.insertId
            },
            {
                email: 'jane@test.com',
                name: 'Jane Smith',
                password: hashedPassword,
                role: 'participant',
                company_id: companyId,
                department_id: hrDept.insertId
            }
        ];

        for (const user of users) {
            await connection.execute(
                'INSERT INTO users (email, name, password_hash, role, company_id, department_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [user.email, user.name, user.password, user.role, user.company_id, user.department_id]
            );
            console.log(`✅ Created user: ${user.email} (Role: ${user.role})`);
        }

        // Create a sample course
        const [courseResult] = await connection.execute(
            'INSERT INTO courses (title, description, target_role) VALUES (?, ?, ?)',
            ['Introduction to AI Act Compliance', 'Learn the fundamentals of EU AI Act compliance and regulations', 'all']
        );
        const courseId = courseResult.insertId;
        console.log('✅ Created sample course');

        // Create sample modules
        const [module1Result] = await connection.execute(
            'INSERT INTO modules (title, description, estimated_duration_minutes) VALUES (?, ?, ?)',
            ['Understanding AI Regulations', 'Overview of AI regulations in the EU', 45]
        );
        const [module2Result] = await connection.execute(
            'INSERT INTO modules (title, description, estimated_duration_minutes) VALUES (?, ?, ?)',
            ['Risk Assessment', 'How to assess AI system risks', 60]
        );
        console.log('✅ Created sample modules');

        // Link modules to course
        await connection.execute(
            'INSERT INTO course_modules (course_id, module_id, module_order) VALUES (?, ?, ?)',
            [courseId, module1Result.insertId, 1]
        );
        await connection.execute(
            'INSERT INTO course_modules (course_id, module_id, module_order) VALUES (?, ?, ?)',
            [courseId, module2Result.insertId, 2]
        );
        console.log('✅ Linked modules to course');

        // Create sample lessons
        const lessons = [
            { module_id: module1Result.insertId, title: 'Introduction to EU AI Act', content_type: 'video', order: 1 },
            { module_id: module1Result.insertId, title: 'Key Principles', content_type: 'text', order: 2 },
            { module_id: module1Result.insertId, title: 'Knowledge Check', content_type: 'quiz', order: 3 },
            { module_id: module2Result.insertId, title: 'Risk Categories', content_type: 'video', order: 1 },
            { module_id: module2Result.insertId, title: 'Assessment Tools', content_type: 'text', order: 2 },
            { module_id: module2Result.insertId, title: 'Practice Simulation', content_type: 'lab_simulation', order: 3 }
        ];

        for (const lesson of lessons) {
            const contentData = {
                duration: lesson.content_type === 'video' ? 600 : 300,
                url: lesson.content_type === 'video' ? 'https://example.com/video.mp4' : null,
                content: lesson.content_type === 'text' ? 'Sample lesson content here...' : null,
                questions: lesson.content_type === 'quiz' ? [
                    {
                        question: 'What is the EU AI Act?',
                        options: ['A regulation', 'A guideline', 'A suggestion', 'None'],
                        correct: 0
                    }
                ] : null
            };

            await connection.execute(
                'INSERT INTO lessons (module_id, title, content_type, content_data, lesson_order) VALUES (?, ?, ?, ?, ?)',
                [lesson.module_id, lesson.title, lesson.content_type, JSON.stringify(contentData), lesson.order]
            );
        }
        console.log('✅ Created sample lessons');

        // Assign course to company
        await connection.execute(
            'INSERT INTO course_assignments (course_id, company_id, department_id, assigned_at) VALUES (?, ?, NULL, NOW())',
            [courseId, companyId]
        );
        console.log('✅ Assigned course to company');

        console.log('\n📋 Test Users Created:');
        console.log('================================');
        console.log('Admin:       admin@test.com / password123');
        console.log('Manager:     manager@test.com / password123');
        console.log('Participant: participant@test.com / password123');
        console.log('Participant: john@test.com / password123');
        console.log('Participant: jane@test.com / password123');
        console.log('================================\n');
        console.log('✨ Test data seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

seedTestData();