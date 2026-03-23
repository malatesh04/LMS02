const axios = require('axios');
const fs = require('fs');

async function checkLiveSignup() {
    console.log('Hitting live Vercel endpoint...');
    try {
        const res = await axios.post('https://learning-web-lac.vercel.app/api/auth/signup', {
            name: "Test Debug 2",
            email: "debug2@test.com",
            password: "password",
            role: "student"
        });
        console.log("SUCCESS:", res.data);
    } catch (err) {
        fs.writeFileSync('err.log', JSON.stringify(err.response?.data || { error: err.message }, null, 2));
        console.log("FAIL written to err.log");
    }
}

checkLiveSignup();
