const express = require('express');
const db = require('../db/pool');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

const verifyCourseOwnership = async (userId, courseId, userRole) => {
    if (userRole === 'admin') return true;
    const courseRes = await db.query('SELECT instructor_id FROM courses WHERE course_id = $1', [courseId]);
    if (courseRes.rows.length === 0) return false;
    return courseRes.rows[0].instructor_id === userId;
};

router.post('/courses/:id/sections', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, order_number } = req.body;

        if (!(await verifyCourseOwnership(req.user.user_id, id, req.user.role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const newSection = await db.query(
            'INSERT INTO sections (course_id, title, order_number) VALUES ($1, $2, $3) RETURNING *',
            [id, title, order_number]
        );
        res.json(newSection.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/sections/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, order_number } = req.body;

        const sectionRes = await db.query('SELECT course_id FROM sections WHERE section_id = $1', [id]);
        if (sectionRes.rows.length === 0) return res.status(404).json({ error: 'Section not found' });

        if (!(await verifyCourseOwnership(req.user.user_id, sectionRes.rows[0].course_id, req.user.role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await db.query(
            'UPDATE sections SET title = $1, order_number = $2 WHERE section_id = $3 RETURNING *',
            [title, order_number, id]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/sections/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const sectionRes = await db.query('SELECT course_id FROM sections WHERE section_id = $1', [id]);
        if (sectionRes.rows.length === 0) return res.status(404).json({ error: 'Section not found' });

        if (!(await verifyCourseOwnership(req.user.user_id, sectionRes.rows[0].course_id, req.user.role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('DELETE FROM sections WHERE section_id = $1', [id]);
        res.json({ message: 'Section deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/sections/:id/lessons', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, youtube_url, duration_seconds, order_number, description } = req.body;

        const sectionRes = await db.query('SELECT course_id FROM sections WHERE section_id = $1', [id]);
        if (sectionRes.rows.length === 0) return res.status(404).json({ error: 'Section not found' });

        if (!(await verifyCourseOwnership(req.user.user_id, sectionRes.rows[0].course_id, req.user.role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const newLesson = await db.query(
            'INSERT INTO lessons (section_id, title, youtube_url, duration_seconds, order_number, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, title, youtube_url, duration_seconds || 0, order_number, description]
        );
        res.json(newLesson.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/lessons/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, youtube_url, duration_seconds, order_number, description } = req.body;

        const lessonRes = await db.query(
            'SELECT s.course_id FROM lessons l JOIN sections s ON l.section_id = s.section_id WHERE l.lesson_id = $1',
            [id]
        );
        if (lessonRes.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });

        if (!(await verifyCourseOwnership(req.user.user_id, lessonRes.rows[0].course_id, req.user.role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updated = await db.query(
            'UPDATE lessons SET title = $1, youtube_url = $2, duration_seconds = $3, order_number = $4, description = $5 WHERE lesson_id = $6 RETURNING *',
            [title, youtube_url, duration_seconds, order_number, description, id]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/lessons/:id', authMiddleware, roleMiddleware(['instructor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const lessonRes = await db.query(
            'SELECT s.course_id FROM lessons l JOIN sections s ON l.section_id = s.section_id WHERE l.lesson_id = $1',
            [id]
        );
        if (lessonRes.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });

        if (!(await verifyCourseOwnership(req.user.user_id, lessonRes.rows[0].course_id, req.user.role))) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('DELETE FROM lessons WHERE lesson_id = $1', [id]);
        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/lessons/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.user_id;

        console.log('Getting lesson:', id, 'for student:', studentId);

        const lessonRes = await db.query(`
            SELECT l.*, s.course_id 
            FROM lessons l
            JOIN sections s ON l.section_id = s.section_id
            WHERE lesson_id = $1
        `, [id]);

        if (lessonRes.rows.length === 0) {
            console.log('Lesson not found:', id);
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const currentLesson = lessonRes.rows[0];
        const courseId = currentLesson.course_id;

        console.log('Lesson found, courseId:', courseId);

        // Check if user is enrolled in this course
        const enrollRes = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );

        if (enrollRes.rows.length === 0) {
            console.log('User not enrolled in course:', courseId);
            return res.status(403).json({ error: 'Not enrolled in this course' });
        }

        const allLessonsRes = await db.query(`
            SELECT l.lesson_id, p.status
            FROM lessons l
            JOIN sections s ON l.section_id = s.section_id
            LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.student_id = $2
            WHERE s.course_id = $1
            ORDER BY s.order_number, l.order_number
        `, [courseId, studentId]);

        const allLessons = allLessonsRes.rows;
        let locked = false;
        let previous_lesson_id = null;
        let next_lesson_id = null;

        for (let i = 0; i < allLessons.length; i++) {
            if (String(allLessons[i].lesson_id) === String(id)) {
                if (i > 0) {
                    previous_lesson_id = allLessons[i - 1].lesson_id;
                    locked = allLessons[i - 1].status !== 'completed';
                }
                if (i < allLessons.length - 1) {
                    next_lesson_id = allLessons[i + 1].lesson_id;
                }
                break;
            }
        }

        res.json({
            ...currentLesson,
            locked,
            previous_lesson_id,
            next_lesson_id
        });
    } catch (err) {
        console.error('Error in /lessons/:id:', err.message);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

module.exports = router;
