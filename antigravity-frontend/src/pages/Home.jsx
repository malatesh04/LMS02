import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Brain, ArrowRight, Star, Code, PlayCircle } from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';
import GlassCard from '../components/ui/GlassCard';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Fetch random or highly rated courses to simulate trending
                const res = await api.get('/courses');
                // just pick top 3
                setTrending(res.data.slice(0, 3));
            } catch (err) {
                console.error(err);
            }
        };
        fetchTrending();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Background glowing orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

            {/* HERO SECTION */}
            <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
                <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    variants={containerVariants}
                    className="max-w-4xl flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
                        <Sparkles size={16} className="text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-300">Introducing Hell Paradise LMS 2.0</span>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants} 
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
                    >
                        The Future of Learning is <br/>
                        <span className="text-gradient">Intelligent</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
                        Build real skills faster with curated, AI-powered learning paths. Join the elite platform built for serious learners and product engineers.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <AnimatedButton to={user ? "/courses" : "/signup"} variant="primary" className="w-full sm:w-auto py-4 px-8 text-base">
                            Start Learning Free
                            <ArrowRight size={18} />
                        </AnimatedButton>
                        <AnimatedButton to="/courses" variant="ghost" className="w-full sm:w-auto py-4 px-8 border border-white/10 hover:border-white/20 text-base">
                            Explore Courses
                        </AnimatedButton>
                    </motion.div>

                    {/* Floating UI Elements / Trusted By (Fake) */}
                    <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-slate-800/60 w-full flex flex-col items-center">
                        <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-widest">Built for modern tech stacks</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Fake logos */}
                            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-500"/> React</div>
                            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-purple-500"/> Framer</div>
                            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-black border border-white/20"/> Next.js</div>
                            <div className="text-xl font-bold flex items-center gap-2"><div className="w-6 h-6 rotate-45 bg-emerald-500"/> Node</div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* FEATURE STRIP */}
            <section className="relative py-24 px-6 border-y border-slate-800/50 bg-slate-900/30 backdrop-blur-sm z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <GlassCard hoverEffect={true} delay={0.1}>
                            <div className="p-8">
                                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                                    <Brain size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Smart Learning</h3>
                                <p className="text-slate-400 leading-relaxed">Adaptive learning paths that shape around your progress, ensuring you master every concept faster.</p>
                            </div>
                        </GlassCard>
                        
                        <GlassCard hoverEffect={true} delay={0.2}>
                            <div className="p-8">
                                <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">AI Recommendations</h3>
                                <p className="text-slate-400 leading-relaxed">Our unified AI chatbot acts as your personal tutor, guiding you through roadblocks and generating practice materials.</p>
                            </div>
                        </GlassCard>

                        <GlassCard hoverEffect={true} delay={0.3}>
                            <div className="p-8">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                                    <Code size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Real-world Courses</h3>
                                <p className="text-slate-400 leading-relaxed">Stop watching generic tutorials. Build full-stack, production-ready applications structured by industry experts.</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* TRENDING COURSES */}
            <section className="relative py-32 px-6 max-w-7xl mx-auto z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trending Now</h2>
                        <p className="text-slate-400 max-w-2xl">Discover the most popular courses engineering teams are taking right now.</p>
                    </div>
                    <AnimatedButton to="/courses" variant="secondary" className="hidden md:flex">
                        View All
                    </AnimatedButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trending.map((course, i) => (
                        <GlassCard key={course.course_id} delay={0.1 * (i + 1)}>
                            <Link to={`/courses/${course.course_id}`} className="block relative group">
                                <div className="aspect-video w-full overflow-hidden rounded-t-2xl relative bg-slate-800">
                                    {course.thumbnail_url ? (
                                        <img 
                                            src={course.thumbnail_url} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PlayCircle size={48} className="text-slate-600" />
                                        </div>
                                    )}
                                    {/* Glass Overlay on image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                    
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                                        Pro
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star size={14} className="text-orange-400 fill-orange-400" />
                                        <span className="text-sm font-medium text-slate-300">4.9 (120 reviews)</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                <span className="text-xs font-bold">{course.instructor_name?.charAt(0) || 'I'}</span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-300">
                                                {course.instructor_name || 'Instructor'}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-white">
                                            {course.price > 0 ? `₹${course.price}` : 'Free'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </GlassCard>
                    ))}
                    
                    {/* Fallbacks if DB is empty */}
                    {trending.length === 0 && (
                        [1, 2, 3].map(item => (
                            <GlassCard key={item}>
                                <div className="aspect-video w-full bg-slate-800 animate-pulse rounded-t-2xl" />
                                <div className="p-6">
                                    <div className="h-6 w-3/4 bg-slate-800 animate-pulse rounded mb-4" />
                                    <div className="h-4 w-full bg-slate-800 animate-pulse rounded mb-2" />
                                    <div className="h-4 w-5/6 bg-slate-800 animate-pulse rounded" />
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
                
                <div className="mt-8 flex justify-center md:hidden">
                    <AnimatedButton to="/courses" variant="secondary" className="w-full">
                        View All Courses
                    </AnimatedButton>
                </div>
            </section>
        </div>
    );
};

export default Home;
