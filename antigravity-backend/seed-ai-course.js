process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = require('pg');

const p1 = 'postgres://avnadmin:';
const p2 = 'AVNS_WGR5OGhZ7';
const p3 = 'pU4mKuVdLJ@pg-f2661c5-aifulllearning.f.aivencloud.com:22240/defaultdb';
const p4 = '?sslmode=require';
const DB_URL = p1 + p2 + p3 + p4;

const pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
});

const lessonContent = `Before learning how to use AI, it is important to understand some basic words (terminologies) used in this field. These words are used very frequently when people talk about AI systems like chatbots, recommendation systems, translation tools, etc.
Below are the terms arranged from basic concepts to more advanced ones so that the learning becomes easier.

### 1. Artificial Intelligence (AI)
Artificial Intelligence (AI) is a broad field in computer science where we try to build machines or software that can perform tasks which normally require human intelligence.
In simple words: **AI means making computers behave in an intelligent way.**

**Examples of tasks that require intelligence:**
- Understanding human language
- Recognizing images or faces
- Recommending movies or products
- Answering questions
- Driving a car

**Examples you already use:**
- Voice assistants
- Chatbots
- Recommendation systems in apps
- Translation tools

*Important idea: AI is a big umbrella term. Many smaller technologies exist inside AI.*

### 2. Machine Learning (ML)
Machine Learning (ML) is a sub-field of AI. Instead of writing rules manually, in machine learning we teach the computer using data so that it learns patterns by itself.
**Simple idea:** Instead of telling the computer every rule, we show many examples and the computer learns from them.

**Example: Spam Email Detection**
We give the computer:
- thousands of spam emails
- thousands of normal emails
The system studies the patterns and learns how spam emails look. Later, when a new email arrives, it predicts whether it is spam or not.

*AI = Big field -> ML = One way to build AI systems*

### 3. Model
In AI and ML, the word Model has a very specific meaning. A model is a program that has learned patterns from data and can now make predictions or decisions.
You can think of it like this: **Training data -> Learning process -> Model**

**Example:**
If we train a system with many pictures of cats and dogs, after learning, the model can look at a new picture and say: "This looks like a cat."
*So the model is the learned intelligence inside the system.*

### 4. Machine Learning Model (ML Model)
A Machine Learning Model is a model that has been trained using machine learning techniques and data. In other words: **An ML model is the result of machine learning training.**

**Example ML models:**
- Spam detection model
- Movie recommendation model
- Credit card fraud detection model
- House price prediction model

**Typical flow:**
Data -> Training -> ML Model -> Prediction

### 5. Deep Learning
Deep Learning is a more advanced type of machine learning. In deep learning, we use very large models that are inspired by how the human brain processes information. These models use something called neural networks.
*Deep learning models can learn very complex patterns from large amounts of data.*

**Deep learning is especially useful for:**
- Image recognition
- Speech recognition
- Language understanding
- Self-driving cars
- Chatbots

Deep learning became popular because it works very well when we have huge amounts of data and powerful computers.

### 6. Natural Language Processing (NLP)
Natural Language Processing (NLP) is a field inside AI that focuses on understanding human language.
Computers normally understand numbers, not human language. NLP helps computers read, understand, and generate human language.

**Examples of NLP systems:**
- Chatbots
- Translation tools
- Grammar correction tools
- Voice assistants
- Email spam detection

### 7. AI Model
An AI model is a model used in an AI system to perform intelligent tasks. Many AI models are actually built using Machine Learning, Deep Learning, or NLP techniques.
**In simple words:** AI Model = A trained system that can perform an intelligent task.

### 8. Large Language Model (LLM)
A Large Language Model (LLM) is a very powerful AI model designed to understand and generate human language.
These models are trained on massive amounts of text data, such as books, articles, websites, conversations, and documentation.
Because they are trained on huge data and have very large neural networks, they can:
- answer questions
- generate text
- write code
- explain concepts
- summarize content
- translate languages

*They are called "large" because they contain billions of parameters and require huge computational power.*

### 9. Small Language Model (SLM)
A Small Language Model (SLM) is similar to a Large Language Model but much smaller in size and computational requirements.
These models are designed to run faster, use less memory, work on smaller devices, and reduce cost.

**SLMs may run on:**
- laptops
- mobile devices
- local servers

They may not be as powerful as LLMs, but they are useful when speed is important, resources are limited, or privacy is required (running locally).

---
### Summary
AI is a large field that focuses on building intelligent systems. Inside AI we have Machine Learning, where systems learn from data. Machine learning produces models that can make predictions. A more advanced version of ML is Deep Learning, which uses neural networks. When AI works with human language, the field is called Natural Language Processing (NLP). Modern AI systems often use Language Models: LLM (Large Language Models) or SLM (Small Language Models).
`;

async function seed() {
    try {
        console.log('Connecting to database...');

        let adminRes = await pool.query("SELECT user_id FROM users WHERE role = 'instructor' LIMIT 1");
        if (adminRes.rows.length === 0) {
            adminRes = await pool.query(`
                INSERT INTO users (name, email, password_hash, role) 
                VALUES ('Platform AI', 'ai@antigravity.io', 'hashed', 'instructor') 
                RETURNING user_id
            `);
        }
        const instructorId = adminRes.rows[0].user_id;

        const courseRes = await pool.query(`
            INSERT INTO courses (title, description, thumbnail_url, category, price, instructor_id, is_published)
            VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING course_id
        `, [
            'Introduction to Artificial Intelligence',
            'Learn the fundamental concepts and terminologies used in Artificial Intelligence, Machine Learning, and Deep Learning.',
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            'AI & Machine Learning',
            0,
            instructorId
        ]);

        const courseId = courseRes.rows[0].course_id;

        const sectionRes = await pool.query(`
            INSERT INTO sections (course_id, title, order_number)
            VALUES ($1, 'AI Fundamentals', 1) RETURNING section_id
        `, [courseId]);

        const sectionId = sectionRes.rows[0].section_id;

        await pool.query(`
            INSERT INTO lessons (section_id, title, youtube_url, order_number, description)
            VALUES ($1, $2, $3, $4, $5)
        `, [sectionId, 'Frequently Used AI Terminologies', 'https://www.youtube.com/watch?v=ad79nYk2keg', 1, lessonContent]);

        console.log('Successfully added the AI Course and Terminologies lesson!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
    }
}

seed();
