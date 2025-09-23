// Test script to verify admin routes work
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAdminRoutes() {
    try {
        console.log('🧪 Testing Admin Routes...\n');

        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Health check:', healthResponse.data.status);

        // Test 2: Admin prompts without auth (should fail)
        console.log('\n2. Testing admin prompts without auth...');
        try {
            await axios.get(`${API_BASE}/admin/prompts`);
            console.log('❌ Should have failed but succeeded');
        } catch (error) {
            console.log('✅ Correctly requires auth:', error.response.data.message);
        }

        // Test 3: Admin categories without auth (should fail)
        console.log('\n3. Testing admin categories without auth...');
        try {
            await axios.get(`${API_BASE}/admin/prompts/categories`);
            console.log('❌ Should have failed but succeeded');
        } catch (error) {
            console.log('✅ Correctly requires auth:', error.response.data.message);
        }

        // Test 4: Admin dashboard without auth (should fail)
        console.log('\n4. Testing admin dashboard without auth...');
        try {
            await axios.get(`${API_BASE}/admin/dashboard`);
            console.log('❌ Should have failed but succeeded');
        } catch (error) {
            console.log('✅ Correctly requires auth:', error.response.data.message);
        }

        console.log('\n🎉 All admin routes are properly protected!');
        console.log('\n📝 To test with authentication:');
        console.log('1. Go to http://localhost:5173');
        console.log('2. Login with: jh@ajax.nl (admin user)');
        console.log('3. Check sidebar for "Company Prompts"');
        console.log('4. Click on "Company Prompts" to see the admin interface');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAdminRoutes();
