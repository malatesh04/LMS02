const express = require('express');
const db = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/progress/:lessonId', authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { course_id, last_position_seconds, is_completed } = req.body;
        const student_id = req.user.user_id;

        const updateStatus = is_completed ? 'completed' : 'in_progress';

        await db.query(`
            INSERT INTO progress (student_id, course_id, lesson_id, status, last_position_seconds, completed_at)
            VALUES ($1, $2, $3, $4, $5, CASE WHEN $4::lesson_status = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END)
            ON CONFLICT (student_id, lesson_id)
            DO UPDATE SET 
                last_position_seconds = EXCLUDED.last_position_seconds,
                status = CASE WHEN EXCLUDED.status = 'completed' THEN 'completed' ELSE progress.status END,
                completed_at = CASE WHEN EXCLUDED.status = 'completed' AND progress.status != 'completed' THEN CURRENT_TIMESTAMP ELSE progress.completed_at END
        `, [student_id, course_id, lessonId, updateStatus, last_position_seconds || 0]);

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/videos/:lessonId', authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const studentId = req.user.user_id;
        const progressRes = await db.query(
            "SELECT last_position_seconds, status FROM progress WHERE student_id = $1 AND lesson_id = $2",
            [studentId, lessonId]
        );
        if (progressRes.rows.length === 0) {
            return res.json({ last_position_seconds: 0, is_completed: false });
        }
        res.json({
            last_position_seconds: progressRes.rows[0].last_position_seconds,
            is_completed: progressRes.rows[0].status === 'completed'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const progressRes = await db.query(
            "SELECT lesson_id FROM progress WHERE student_id = $1 AND course_id = $2 AND status = 'completed'",
            [studentId, courseId]
        );

        res.json(progressRes.rows.map(row => row.lesson_id));
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/:courseId/percentage', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const result = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE p.status = 'completed') AS completed_count,
        COUNT(l.lesson_id) AS total_lessons,
        CASE WHEN COUNT(l.lesson_id) > 0 THEN
          ROUND(COUNT(*) FILTER (WHERE p.status = 'completed') * 100.0 / COUNT(l.lesson_id), 0)
        ELSE 0 END AS percentage
      FROM lessons l
      JOIN sections s ON l.section_id = s.section_id
      LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.student_id = $1
      WHERE s.course_id = $2
    `, [studentId, courseId]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/progress/:courseId/last-lesson', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const result = await db.query(`
      SELECT lesson_id FROM progress
      WHERE student_id = $1 AND course_id = $2
      ORDER BY completed_at DESC
      LIMIT 1
    `, [studentId, courseId]);

        const last_lesson_id = result.rows.length > 0 ? result.rows[0].lesson_id : null;
        res.json({ last_lesson_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
