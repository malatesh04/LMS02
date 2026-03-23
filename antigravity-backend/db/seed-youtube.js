require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// predefined playlists for course injection - Real YouTube Playlists
const playlists = [
    // Original courses
    { id: 'PLZPZq0r_RZOMhMvvhyL8c1gM-b-02v-H-', price: 49.99, category: 'Web Development', title: 'React JS Full Course' },
    { id: 'PLoYCgNOvdVACAOGSquJ8B_LDE340a6XlO', price: 99.99, category: 'Blockchain', title: 'Web3 and Solidity' },
    { id: 'PLu0W_9lII9agwh1XjRt242xIpHhPT2llg', price: 29.99, category: 'Programming', title: 'Python for Beginners' },
    { id: 'PL4cUxeGkcC9gcy9lrvXZ75evwG23M_2Rk', price: 19.99, category: 'CSS & Design', title: 'Tailwind CSS Course' },
    { id: 'PL-osiE80TeTs4UjLw5MM6OjgkjFeYwxa0', price: 59.99, category: 'Backend Engineering', title: 'Node.js/Express Complete' },
    { id: 'PLZPZq0r_RZOO1zkgO4bIdfuLpizCeCG5J', price: 89.99, category: 'Databases', title: 'PostgreSQL Advanced' }
];

async function seedYouTubeCourses() {
    if (!YOUTUBE_API_KEY) {
        console.error('YOUTUBE_API_KEY missing from .env');
        process.exit(1);
    }

    try {
        console.log('Fetching super admin / first user...');
        let adminRes = await pool.query('SELECT user_id FROM users WHERE role = $1 LIMIT 1', ['instructor']);

        // Create instructor if none
        if (adminRes.rows.length === 0) {
            adminRes = await pool.query(`
            INSERT INTO users (name, email, password_hash, role) 
            VALUES ('Platform AI', 'ai@antigravity.io', 'hashed', 'instructor') 
            RETURNING user_id
        `);
        }
        const instructorId = adminRes.rows[0].user_id;

        for (const playlist of playlists) {
            console.log(`\nFetching playlist: ${playlist.id}`);

            const pRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlist.id}&key=${YOUTUBE_API_KEY}`);
            if (!pRes.data.items || pRes.data.items.length === 0) continue;

            const snippet = pRes.data.items[0].snippet;
            const title = snippet.title;
            const desc = snippet.description || 'A comprehensive YouTube course.';
            const thumb = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;

            const courseRes = await pool.query(`
        INSERT INTO courses (title, description, thumbnail_url, category, price, instructor_id, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING course_id
      `, [title, desc, thumb, playlist.category, playlist.price, instructorId, true]);

            const courseId = courseRes.rows[0].course_id;

            const sectionRes = await pool.query(`
        INSERT INTO sections (course_id, title, order_number)
        VALUES ($1, 'Main Modules', 1) RETURNING section_id
      `, [courseId]);

            const sectionId = sectionRes.rows[0].section_id;

            // Get videos
            let pageToken = '';
            let videoCount = 0;
            do {
                const vRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlist.id}&key=${YOUTUBE_API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`);

                for (const item of vRes.data.items) {
                    const vTitle = item.snippet.title;
                    const vId = item.snippet.resourceId.videoId;

                    if (vTitle.includes('Private') || vTitle.includes('Deleted')) continue;

                    videoCount++;
                    await pool.query(`
             INSERT INTO lessons (section_id, title, youtube_url, order_number, description)
             VALUES ($1, $2, $3, $4, $5)
          `, [sectionId, vTitle, `https://www.youtube.com/watch?v=${vId}`, videoCount, 'Enjoy the lesson!']);
                }
                pageToken = vRes.data.nextPageToken;
            } while (pageToken);

            console.log(`-> Inserted course "${title}" with ${videoCount} videos.`);
        }
        console.log('\n✅ Database seeding complete!');
    } catch (e) {
        console.error('Migration failed:', e.response?.data || e.message);
    } finally {
        await pool.end();
    }
}

// Add sample courses directly without YouTube
async function seedManualCourses() {
    try {
        console.log('Adding manual sample courses...');

        // Get or create instructor
        let adminRes = await pool.query('SELECT user_id FROM users WHERE role = $1 LIMIT 1', ['instructor']);
        if (adminRes.rows.length === 0) {
            adminRes = await pool.query(`
                INSERT INTO users (name, email, password_hash, role) 
                VALUES ('Platform AI', 'ai@antigravity.io', 'hashed', 'instructor') 
                RETURNING user_id
            `);
        }
        const instructorId = adminRes.rows[0].user_id;

        // Sample courses with lessons
        const sampleCourses = [
            {
                title: 'Complete Java Programming Bootcamp',
                description: 'Learn Java from scratch to advanced concepts. Perfect for beginners and those switching from other languages.',
                category: 'Programming',
                price: 499,
                lessons: [
                    { title: 'Introduction to Java', youtube_url: 'https://www.youtube.com/watch?v=TBWX97e1E9g' },
                    { title: 'Setting Up Java Environment', youtube_url: 'https://www.youtube.com/watch?v=z2d3RzXw3os' },
                    { title: 'Variables and Data Types', youtube_url: 'https://www.youtube.com/watch?v=7i4X6oHj1Vw' },
                    { title: 'Control Flow Statements', youtube_url: 'https://www.youtube.com/watch?v=2GqG3Qx5YHw' },
                    { title: 'Methods in Java', youtube_url: 'https://www.youtube.com/watch?v=r0xJ4G3Qw3s' },
                    { title: 'Object Oriented Programming', youtube_url: 'https://www.youtube.com/watch?v=8j1x3J4G5Qw' },
                    { title: 'Exception Handling', youtube_url: 'https://www.youtube.com/watch?v=9d3X5G7Y2Qw' }
                ]
            },
            {
                title: 'Data Structures & Algorithms Masterclass',
                description: 'Master DSA concepts with practical implementations. Essential for coding interviews.',
                category: 'Programming',
                price: 799,
                lessons: [
                    { title: 'Introduction to DSA', youtube_url: 'https://www.youtube.com/watch?v=CBYPPZ7S6mQ' },
                    { title: 'Arrays and Strings', youtube_url: 'https://www.youtube.com/watch?v=8Xy7Y3Qx5YHw' },
                    { title: 'Linked Lists', youtube_url: 'https://www.youtube.com/watch?v=9Y3X2G7Y4Qw' },
                    { title: 'Stacks and Queues', youtube_url: 'https://www.youtube.com/watch?v=1X2Y3G8Z9Qw' },
                    { title: 'Trees and Graphs', youtube_url: 'https://www.youtube.com/watch?v=2Y4X3Z8Q9Hw' },
                    { title: 'Sorting Algorithms', youtube_url: 'https://www.youtube.com/watch?v=3G5X3Y2Q8Hw' },
                    { title: 'Dynamic Programming', youtube_url: 'https://www.youtube.com/watch?v=4Y7X3G2Q9Hw' }
                ]
            },
            {
                title: 'Flutter Mobile App Development',
                description: 'Build beautiful cross-platform mobile apps with Flutter and Dart.',
                category: 'Mobile Development',
                price: 899,
                lessons: [
                    { title: 'Flutter Introduction', youtube_url: 'https://www.youtube.com/watch?v=1ukpY3G4YQw' },
                    { title: 'Dart Basics', youtube_url: 'https://www.youtube.com/watch?v=2X3Y4Z5Q9Hw' },
                    { title: 'Widgets Deep Dive', youtube_url: 'https://www.youtube.com/watch?v=3Y4Z5X6Q8Hw' },
                    { title: 'State Management', youtube_url: 'https://www.youtube.com/watch?v=4Y5Z6X7Q7Hw' },
                    { title: 'Navigation & Routing', youtube_url: 'https://www.youtube.com/watch?v=5Y6Z7X8Q6Hw' },
                    { title: 'REST API Integration', youtube_url: 'https://www.youtube.com/watch?v=6Y7Z8X9Q5Hw' },
                    { title: 'Publishing to App Stores', youtube_url: 'https://www.youtube.com/watch?v=7Y8Z9X4Q4Hw' }
                ]
            },
            {
                title: 'AWS Cloud Practitioner Certification',
                description: 'Prepare for AWS certification. Learn cloud fundamentals and AWS services.',
                category: 'DevOps',
                price: 699,
                lessons: [
                    { title: 'Cloud Computing Basics', youtube_url: 'https://www.youtube.com/watch?v=S3qcB9X4YQw' },
                    { title: 'AWS Global Infrastructure', youtube_url: 'https://www.youtube.com/watch?v=1X2Y3Z4Q9Hw' },
                    { title: 'AWS Compute Services', youtube_url: 'https://www.youtube.com/watch?v=2Y3X4Z5Q8Hw' },
                    { title: 'AWS Storage Services', youtube_url: 'https://www.youtube.com/watch?v=3Y4Z5X6Q7Hw' },
                    { title: 'AWS Networking', youtube_url: 'https://www.youtube.com/watch?v=4Y5Z6X7Q6Hw' },
                    { title: 'Security in AWS', youtube_url: 'https://www.youtube.com/watch?v=5Y6Z7X8Q5Hw' },
                    { title: 'AWS Pricing', youtube_url: 'https://www.youtube.com/watch?v=6Y7Z8X9Q4Hw' }
                ]
            },
            {
                title: 'UI/UX Design with Figma',
                description: 'Learn modern UI/UX design principles and master Figma for creating stunning interfaces.',
                category: 'Design',
                price: 599,
                lessons: [
                    { title: 'UI/UX Fundamentals', youtube_url: 'https://www.youtube.com/watch?v=7Y8Z9X3Q9Hw' },
                    { title: 'Figma Interface Overview', youtube_url: 'https://www.youtube.com/watch?v=8Y9Z3X4Q8Hw' },
                    { title: 'Working with Components', youtube_url: 'https://www.youtube.com/watch?v=9Y1Z4X5Q7Hw' },
                    { title: 'Prototyping Basics', youtube_url: 'https://www.youtube.com/watch?v=1Y2Z5X6Q6Hw' },
                    { title: 'Design Systems', youtube_url: 'https://www.youtube.com/watch?v=2Y3Z6X7Q5Hw' },
                    { title: 'Mobile Design', youtube_url: 'https://www.youtube.com/watch?v=3Y4Z7X8Q4Hw' },
                    { title: 'Portfolio Building', youtube_url: 'https://www.youtube.com/watch?v=4Y5Z8X9Q3Hw' }
                ]
            },
            {
                title: 'Go Programming Language Complete',
                description: 'Learn Go from basics to building concurrent applications.',
                category: 'Backend',
                price: 549,
                lessons: [
                    { title: 'Go Introduction', youtube_url: 'https://www.youtube.com/watch?v=5Y6Z9X3Q8Hw' },
                    { title: 'Go Variables & Types', youtube_url: 'https://www.youtube.com/watch?v=6Y7Z1X4Q7Hw' },
                    { title: 'Functions in Go', youtube_url: 'https://www.youtube.com/watch?v=7Y8Z2X5Q6Hw' },
                    { title: 'Structs and Methods', youtube_url: 'https://www.youtube.com/watch?v=8Y9Z3X6Q5Hw' },
                    { title: 'Interfaces', youtube_url: 'https://www.youtube.com/watch?v=9Y1Z4X7Q4Hw' },
                    { title: 'Goroutines and Channels', youtube_url: 'https://www.youtube.com/watch?v=1Y2Z5X8Q3Hw' },
                    { title: 'Building REST APIs', youtube_url: 'https://www.youtube.com/watch?v=2Y3Z6X9Q2Hw' }
                ]
            },
            {
                title: 'Docker & Kubernetes for Beginners',
                description: 'Master containerization and orchestration with Docker and Kubernetes.',
                category: 'DevOps',
                price: 649,
                lessons: [
                    { title: 'Docker Introduction', youtube_url: 'https://www.youtube.com/watch?v=3Y4Z7X1Q8Hw' },
                    { title: 'Docker Images & Containers', youtube_url: 'https://www.youtube.com/watch?v=4Y5Z8X2Q7Hw' },
                    { title: 'Docker Networking', youtube_url: 'https://www.youtube.com/watch?v=5Y6Z9X3Q6Hw' },
                    { title: 'Docker Compose', youtube_url: 'https://www.youtube.com/watch?v=6Y7Z1X4Q5Hw' },
                    { title: 'Kubernetes Basics', youtube_url: 'https://www.youtube.com/watch?v=7Y8Z2X5Q4Hw' },
                    { title: 'Kubernetes Deployments', youtube_url: 'https://www.youtube.com/watch?v=8Y9Z3X6Q3Hw' },
                    { title: 'Services & Ingress', youtube_url: 'https://www.youtube.com/watch?v=9Y1Z4X7Q2Hw' }
                ]
            },
            {
                title: 'JavaScript Interview Preparation',
                description: 'Prepare for JavaScript interviews with common questions and answers.',
                category: 'Programming',
                price: 399,
                lessons: [
                    { title: 'JavaScript Fundamentals Review', youtube_url: 'https://www.youtube.com/watch?v=1Y2Z3X4Q9Hw' },
                    { title: 'Closures and Scope', youtube_url: 'https://www.youtube.com/watch?v=2Y3Z4X5Q8Hw' },
                    { title: 'Promises and Async/Await', youtube_url: 'https://www.youtube.com/watch?v=3Y4Z5X6Q7Hw' },
                    { title: 'Event Loop Explained', youtube_url: 'https://www.youtube.com/watch?v=4Y5Z6X7Q6Hw' },
                    { title: 'Common Array Methods', youtube_url: 'https://www.youtube.com/watch?v=5Y6Z7X8Q5Hw' },
                    { title: 'Design Patterns in JS', youtube_url: 'https://www.youtube.com/watch?v=6Y7Z8X9Q4Hw' },
                    { title: 'Coding Practice', youtube_url: 'https://www.youtube.com/watch?v=7Y8Z9X1Q3Hw' }
                ]
            }
        ];

        for (const course of sampleCourses) {
            const courseRes = await pool.query(`
                INSERT INTO courses (title, description, category, price, instructor_id, is_published)
                VALUES ($1, $2, $3, $4, $5, true)
                ON CONFLICT DO NOTHING
                RETURNING course_id
            `, [course.title, course.description, course.category, course.price, instructorId]);

            if (courseRes.rows.length === 0) {
                // Course already exists, skip
                console.log(`Skipping "${course.title}" - already exists`);
                continue;
            }

            const courseId = courseRes.rows[0].course_id;

            const sectionRes = await pool.query(`
                INSERT INTO sections (course_id, title, order_number)
                VALUES ($1, 'Main Modules', 1)
                RETURNING section_id
            `, [courseId]);

            const sectionId = sectionRes.rows[0].section_id;

            for (let i = 0; i < course.lessons.length; i++) {
                await pool.query(`
                    INSERT INTO lessons (section_id, title, youtube_url, order_number, description)
                    VALUES ($1, $2, $3, $4, $5)
                `, [sectionId, course.lessons[i].title, course.lessons[i].youtube_url, i + 1, 'Complete the lesson to progress']);
            }

            console.log(`Added: ${course.title} with ${course.lessons.length} lessons`);
        }

        console.log('\n✅ Manual courses seeding complete!');
    } catch (e) {
        console.error('Manual seeding failed:', e.message);
    }
}

// Run both seeding functions
async function runSeeding() {
    await seedManualCourses();
    await seedYouTubeCourses();
}

runSeeding();
