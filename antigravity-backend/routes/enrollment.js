const express = require('express');
const db = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Check if payment was made for a course
router.get('/verify-payment/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const enrollRes = await db.query(
            'SELECT payment_status FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );

        if (enrollRes.rows.length === 0) {
            return res.json({ isPaid: false, message: 'Not enrolled' });
        }

        res.json({
            isPaid: enrollRes.rows[0].payment_status === 'completed',
            paymentStatus: enrollRes.rows[0].payment_status
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Record payment (called after successful payment)
router.post('/record-payment/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { paymentId, amount } = req.body;
        const studentId = req.user.user_id;

        // Check if already enrolled
        const enrollRes = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );

        if (enrollRes.rows.length === 0) {
            // Create enrollment with payment
            const newEnrollment = await db.query(
                `INSERT INTO enrollments (student_id, course_id, payment_status, payment_id, amount_paid) 
                VALUES ($1, $2, 'completed', $3, $4) RETURNING *`,
                [studentId, courseId, paymentId, amount]
            );
            return res.json({ success: true, enrollment: newEnrollment.rows[0] });
        }

        // Update existing enrollment
        await db.query(
            `UPDATE enrollments SET payment_status = 'completed', payment_id = $1, amount_paid = $2 
            WHERE student_id = $3 AND course_id = $4`,
            [paymentId, amount, studentId, courseId]
        );

        res.json({ success: true, message: 'Payment recorded successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/enroll/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const courseRes = await db.query('SELECT course_id, price FROM courses WHERE course_id = $1', [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

        const course = courseRes.rows[0];

        // Check if already enrolled
        const existingEnroll = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );

        if (existingEnroll.rows.length > 0) {
            // If already enrolled and paid, allow access
            if (existingEnroll.rows[0].payment_status === 'completed') {
                return res.json({ message: 'Already enrolled and paid', enrollment: existingEnroll.rows[0] });
            }
            // If enrolled but not paid, require payment
            if (course.price > 0) {
                return res.status(402).json({ error: 'Payment required', requiresPayment: true, price: course.price });
            }
        }

        // For free courses, enroll directly
        if (course.price === 0 || course.price === '0' || !course.price) {
            const newEnrollment = await db.query(
                'INSERT INTO enrollments (student_id, course_id, payment_status) VALUES ($1, $2, \'completed\') RETURNING *',
                [studentId, courseId]
            );
            return res.json(newEnrollment.rows[0]);
        }

        // For paid courses, require payment
        return res.status(402).json({ error: 'Payment required', requiresPayment: true, price: course.price });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/my-courses', authMiddleware, async (req, res) => {
    try {
        const studentId = req.user.user_id;

        const result = await db.query(`
      SELECT c.*, e.enrolled_at, e.payment_status, u.name as instructor_name
      FROM courses c 
      JOIN enrollments e ON c.course_id = e.course_id 
      JOIN users u ON c.instructor_id = u.user_id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `, [studentId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/enrollments/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const enrollRes = await db.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);

        res.json({
            isEnrolled: enrollRes.rows.length > 0,
            paymentStatus: enrollRes.rows[0]?.payment_status
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/enroll/:courseId', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.user_id;

        const deleteRes = await db.query(
            'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING *',
            [studentId, courseId]
        );

        if (deleteRes.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        res.json({ success: true, message: 'Unenrolled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/instructor/courses/:courseId/students/:studentId', authMiddleware, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const currentUserId = req.user.user_id;

        if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const checkCourse = await db.query('SELECT instructor_id FROM courses WHERE course_id = $1', [courseId]);
        if (checkCourse.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

        if (checkCourse.rows[0].instructor_id !== currentUserId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to modify this course' });
        }

        await db.query('DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        res.json({ success: true, message: 'Student removed from course' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
