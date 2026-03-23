require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'lms02-34551',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
}
const db = admin.firestore();

const seedCourses = async () => {
    console.log('Seeding courses to Firestore...');
    const courses = [
        {
            title: 'Complete Python Programming',
            description: 'Learn Python from scratch to advanced concepts. Perfect for beginners.',
            category: 'Python',
            price: 1999,
            thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
            instructor_name: 'Platform AI',
            is_published: true,
            total_lessons: 5,
            created_at: new Date()
        },
        {
            title: 'JavaScript Mastery',
            description: 'Master JavaScript from basics to advanced concepts including ES6+ features.',
            category: 'JavaScript',
            price: 1499,
            thumbnail_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
            instructor_name: 'Platform AI',
            is_published: true,
            total_lessons: 6,
            created_at: new Date()
        },
        {
            title: 'React JS Complete Guide',
            description: 'Build modern web apps with React. Includes hooks, context, and more.',
            category: 'Web Development',
            price: 2999,
            thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-45a1465c2479?w=800',
            instructor_name: 'Platform AI',
            is_published: true,
            total_lessons: 4,
            created_at: new Date()
        }
    ];

    for (const course of courses) {
        // Create new course document
        const courseRef = await db.collection('courses').add(course);
        
        // Create sections and lessons
        const sectionRef = await courseRef.collection('sections').add({
            title: 'Main Modules',
            order_number: 1
        });

        const lessons = [
            { title: 'Introduction', video_url: 'https://www.youtube.com/watch?v=eWRfhZUzrAc', order: 1 },
            { title: 'Core Concepts', video_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', order: 2 },
            { title: 'Advanced Methods', video_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', order: 3 }
        ];

        for (const lesson of lessons) {
            await sectionRef.collection('lessons').add(lesson);
        }
        console.log(`Added course: ${course.title} width ID: ${courseRef.id}`);
    }
    
    console.log('Done seeding Firestore!');
};

seedCourses().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
