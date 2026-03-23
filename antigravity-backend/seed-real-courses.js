require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

const playlists = [
    { id: 'PLWKjhJtqVAblfum5WiQblKPwIbqYXkDoC', price: 1999, category: 'Web Development', title: 'Frontend Web Development Bootcamp' },
    { videoId: 'eWRfhZUzrAc', price: 999, category: 'Python', title: 'Python for Beginners' },
    { id: 'PLhQjrBD2T382hIW-IsOVuXP1uMzEvmcE5', price: 2999, category: 'Full Stack', title: 'CS50 Web Programming with Python' },
    { id: 'PLZPZq0r_RZON03iKBjYOsOKr1-TD7z2lH', price: 1499, category: 'JavaScript', title: 'JavaScript Full Course - Beginner to Pro' },
    { id: 'PLu0W_9lII9agwh1XjRt242xIpHhPT2llg', price: 2499, category: 'Python', title: 'Python 100 Days - Complete Course' }
];

async function seed() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        console.log('Clearing old data...');
        // First delete dependent tables to avoid foreign key constraints errors
        await pool.query('DELETE FROM progress');
        await pool.query('DELETE FROM lessons');
        await pool.query('DELETE FROM sections');
        await pool.query('DELETE FROM enrollments');
        await pool.query('DELETE FROM courses');

        console.log('Starting seed from YouTube...');
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

        if (!YOUTUBE_API_KEY) {
            console.error('No YouTube API key found in .env!');
            return;
        }

        // Get or create instructor
        let adminRes = await pool.query("SELECT user_id FROM users WHERE role = 'instructor' LIMIT 1");
        if (adminRes.rows.length === 0) {
            adminRes = await pool.query(`
                INSERT INTO users (name, email, password_hash, role, status) 
                VALUES ('Platform AI', 'ai@antigravity.io', 'hashed', 'instructor', 'approved') 
                RETURNING user_id
            `);
        }
        const instructorId = adminRes.rows[0].user_id;

        let coursesAdded = 0;
        for (const playlist of playlists) {
            try {
                let title, description, thumbnail;

                if (playlist.videoId) {
                    const vRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${playlist.videoId}&key=${YOUTUBE_API_KEY}`);
                    if (!vRes.data.items || vRes.data.items.length === 0) {
                        console.log(`Video ${playlist.videoId} not found`);
                        continue;
                    }
                    const snippet = vRes.data.items[0].snippet;
                    title = playlist.title || snippet.title;
                    description = snippet.description || 'A comprehensive course';
                    thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;
                } else {
                    const pRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlist.id}&key=${YOUTUBE_API_KEY}`);
                    if (!pRes.data.items || pRes.data.items.length === 0) {
                        console.log(`Playlist ${playlist.id} not found`);
                        continue;
                    }
                    const snippet = pRes.data.items[0].snippet;
                    title = playlist.title || snippet.title;
                    description = snippet.description || 'A comprehensive course';
                    thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url;
                }

                const courseRes = await pool.query(`
                    INSERT INTO courses (title, description, thumbnail_url, category, price, instructor_id, is_published)
                    VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING course_id
                `, [title, description, thumbnail, playlist.category, playlist.price, instructorId]);

                const courseId = courseRes.rows[0].course_id;

                const sectionRes = await pool.query(`
                    INSERT INTO sections (course_id, title, order_number)
                    VALUES ($1, 'Main Modules', 1) RETURNING section_id
                `, [courseId]);

                const sectionId = sectionRes.rows[0].section_id;

                if (playlist.videoId) {
                    await pool.query(`
                        INSERT INTO lessons (section_id, title, youtube_url, order_number, description)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [sectionId, title, `https://www.youtube.com/watch?v=${playlist.videoId}`, 1, 'Full Course Video']);
                    coursesAdded++;
                    console.log(`Auto-seeded single video: ${title}`);
                    continue;
                }

                let pageToken = '';
                let videoCount = 0;
                do {
                    const vRes = await axios.get(
                        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${playlist.id}&key=${YOUTUBE_API_KEY}${pageToken ? '&pageToken=' + pageToken : ''}`
                    );

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
                } while (pageToken && videoCount < 10);

                coursesAdded++;
                console.log(`Auto-seeded: ${title} with ${videoCount} videos`);
            } catch (e) {
                console.log(`Error with course ${playlist.title}:`, e.message);
            }
        }
        console.log(`Auto-seed complete: ${coursesAdded} courses added`);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

seed();
