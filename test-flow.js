const api = require('axios');

async function test() {
    const origin = 'http://localhost:5000/api';
    // 1. register
    const regResp = await api.post(`${origin}/auth/register`, {
        name: 'Testy',
        email: `testy_${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
    });
    const token = regResp.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. get courses 
    const coursesResp = await api.get(`${origin}/courses`);
    const course = coursesResp.data[0];
    if (!course) {
        console.log("No courses found!");
        return;
    }
    const courseId = course.course_id;

    // 3. fake a payment completion to enroll
    await api.post(`${origin}/enroll/${courseId}`, {}, { headers });
    // we must simulate payment completed. In server.js auto-migration actually completes pending enrollments. 
    // Let's just create an enrollment and query the db to set it to completed if needed, or see if it defaults.

    // Actually, we can just rely on the existing courses/tree route.
}
test();
