const express = require('express');
const db = require('../db/pool');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/courses', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT DISTINCT c.*, u.name as instructor_name 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.user_id 
      WHERE is_published = true
      ORDER BY c.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/courses/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Ensure price is fetched here too since the frontend may display it
        const result = await db.query(`
      SELECT DISTINCT c.*, u.name as instructor_name 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.user_id 
      WHERE is_published = true 
      AND (
          c.title ILIKE $1 
          OR c.description ILIKE $1 
          OR c.category ILIKE $1 
          OR u.name ILIKE $1
      )
      ORDER BY c.created_at DESC
    `, [`%${q}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const courseRes = await db.query(`
      SELECT c.*, u.name as instructor_name 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.user_id 
      WHERE c.course_id = $1
    `, [id]);

        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        const course = courseRes.rows[0];

        const sectionsRes = await db.query('SELECT * FROM sections WHERE course_id = $1 ORDER BY order_number', [id]);
        const sectionIds = sectionsRes.rows.map(s => s.section_id);

        let lessons = [];
        if (sectionIds.length > 0) {
            const lessonsRes = await db.query(`
        SELECT * FROM lessons 
        WHERE section_id = ANY($1) 
        ORDER BY order_number
      `, [sectionIds]);
            lessons = lessonsRes.rows;
        }

        course.sections = sectionsRes.rows.map(section => ({
            ...section,
            lessons: lessons.filter(l => l.section_id === section.section_id)
        }));

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/courses/:id/tree', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.user_id;

        const courseRes = await db.query(`
      SELECT c.*, u.name as instructor_name 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.user_id 
      WHERE c.course_id = $1
    `, [id]);

        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        const course = courseRes.rows[0];

        const isOwnerOrAdmin = course.instructor_id === studentId || req.user.role === 'admin';

        let isPaid = false;

        if (isOwnerOrAdmin) {
            isPaid = true;
        } else {
            // Check enrollment
            const enrollRes = await db.query(
                'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
                [studentId, id]
            );

            if (enrollRes.rows.length === 0) {
                return res.status(403).json({ error: 'Not enrolled in this course' });
            }

            // Check if user has paid for the course OR if course is free
            isPaid = parseFloat(course.price) === 0 || enrollRes.rows[0].payment_status === 'completed';
        }

        // All lessons locked unless paid
        const allLessonsLocked = !isPaid;

        const sectionsRes = await db.query('SELECT * FROM sections WHERE course_id = $1 ORDER BY order_number', [id]);
        const sectionIds = sectionsRes.rows.map(s => s.section_id);

        let lessons = [];
        if (sectionIds.length > 0) {
            const lessonsRes = await db.query(`
                SELECT l.*, 
                       s.order_number as sec_order,
                       EXISTS(SELECT 1 FROM progress p WHERE p.lesson_id = l.lesson_id AND p.student_id = $2 AND p.status = 'completed') as is_completed
                FROM lessons l
                JOIN sections s ON l.section_id = s.section_id
                WHERE l.section_id = ANY($1) 
                ORDER BY s.order_number, l.order_number
            `, [sectionIds, studentId]);
            lessons = lessonsRes.rows;
        }

        let previousCompleted = true; // First lesson is unlocked if paid
        for (let i = 0; i < lessons.length; i++) {
            // Lock lessons based on payment status
            if (allLessonsLocked) {
                lessons[i].locked = true; // All locked if not paid
            } else {
                lessons[i].locked = !previousCompleted;
                previousCompleted = lessons[i].is_completed;
            }
        }

        course.sections = sectionsRes.rows.map(section => ({
            ...section,
            lessons: lessons.filter(l => l.section_id === section.section_id).map(l => ({
                lesson_id: l.lesson_id,
                title: l.title,
                youtube_url: l.youtube_url,
                duration_seconds: l.duration_seconds,
                order_number: l.order_number,
                is_completed: l.is_completed,
                locked: l.locked
            }))
        }));

        // Add payment status to response so frontend knows if user can play
        course.user_has_paid = isPaid;

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/courses', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { title, description, thumbnail_url, category, is_published, price } = req.body;
        const instructor_id = req.user.user_id;

        const newCourse = await db.query(`
      INSERT INTO courses (title, description, thumbnail_url, category, instructor_id, is_published, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [title, description, thumbnail_url, category, instructor_id, is_published || false, price || 0]);

        res.json(newCourse.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/courses/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, thumbnail_url, category, is_published, price } = req.body;

        const courseRes = await db.query('SELECT instructor_id FROM courses WHERE course_id = $1', [id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        if (courseRes.rows[0].instructor_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updateRes = await db.query(`
      UPDATE courses 
      SET title = $1, description = $2, thumbnail_url = $3, category = $4, is_published = COALESCE($5, is_published), price = COALESCE($6, price)
      WHERE course_id = $7 RETURNING *
    `, [title, description, thumbnail_url, category, is_published, price, id]);

        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/courses/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const courseRes = await db.query('SELECT instructor_id FROM courses WHERE course_id = $1', [id]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
        if (courseRes.rows[0].instructor_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('DELETE FROM courses WHERE course_id = $1', [id]);
        res.json({ message: 'Course deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
