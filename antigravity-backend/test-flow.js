const axios = require('axios');

async function testFlow() {
    console.log('--- Starting API End-to-End Test ---');
    try {
        const api = axios.create({ baseURL: 'http://localhost:5000/api' });

        console.log('1. Registering new Instructor user...');
        const signupRes = await api.post('/auth/signup', {
            name: 'Test Instructor',
            email: 'instructor_test@test.com',
            password: 'password123',
            role: 'instructor'
        });
        const token = signupRes.data.token;
        console.log('Signup Success! Token received.');

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        console.log('2. Creating a new Course...');
        const courseRes = await api.post('/courses', {
            title: 'Antigravity Masterclass',
            description: 'Learn how to build an LMS from scratch.',
            category: 'Software Engineering'
        });
        const courseId = courseRes.data.course_id;
        console.log(`Course Created! ID: ${courseId}`);

        console.log('3. Fetching published courses...');
        const allCourses = await api.get('/courses');
        console.log(`Found ${allCourses.data.length} published courses.`);

        console.log('--- E2E Test Passed Successfully ---');

    } catch (err) {
        console.error('API Test Failed:', err.response?.data || err.message);
    }
}

testFlow();
