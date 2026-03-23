import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { PlayCircle, Clock, BookOpen, User, CheckCircle2 } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import AnimatedButton from '../components/ui/AnimatedButton';
import GlassCard from '../components/ui/GlassCard';
import { motion } from 'framer-motion';

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}`);
                setCourse(res.data);

                if (user) {
                    try {
                        const enrollRes = await api.get(`/enrollments/${id}`);
                        setIsEnrolled(enrollRes.data.isEnrolled);
                    } catch (e) { }
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchCourse();
    }, [id, user]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const price = parseFloat(course.price) || 0;

        if (price > 0) {
            setIsPaymentModalOpen(true);
            return;
        }

        processEnrollment();
    };

    const processEnrollment = async () => {
        setEnrolling(true);
        try {
            const price = parseFloat(course.price) || 0;

            // For free courses, enroll directly
            if (price === 0) {
                await api.post(`/enroll/${id}`);
                setIsEnrolled(true);
            } else {
                setIsPaymentModalOpen(true);
            }
        } catch (err) {
            console.error('Enrollment error:', err);
            // Check if already enrolled
            if (err.response?.data?.error === 'Already enrolled and paid' || err.response?.data?.message === 'Already enrolled and paid') {
                setIsEnrolled(true);
            } else {
                alert('Failed to enroll: ' + (err.response?.data?.error || err.message));
            }
        }
        setEnrolling(false);
        setIsPaymentModalOpen(false);
    };

    // Handle successful payment
    const handlePaymentComplete = async () => {
        try {
            // Record payment
            await api.post(`/record-payment/${id}`, {
                paymentId: `PAY${Date.now()}`,
                amount: course.price
            });
            setIsEnrolled(true);
            setIsPaymentModalOpen(false);
        } catch (err) {
            console.error('Payment recording error:', err);
            // Still allow access for demo purposes
            setIsEnrolled(true);
            setIsPaymentModalOpen(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">Loading course details...</p>
        </div>
    );
    if (!course) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-2">Error 404</h1>
            <p className="text-slate-400 text-lg">We couldn't find the course you were looking for.</p>
        </div>
    );

    const totalLessons = course.sections?.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0) || 0;
    const price = parseFloat(course.price) || 0;
    const isPaidCourse = price > 0;

    return (
        <div className="relative py-12 px-6 max-w-7xl mx-auto">
            {/* Background glowing effects */}
            <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-[80%] h-[30%] rounded-[100%] bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden mb-12 shadow-2xl relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none z-10" />
                <div className="h-[40vh] md:h-[50vh] w-full relative">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent flex items-end p-8 md:p-12 z-20">
                        <div className="max-w-4xl">
                            <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold mb-4 uppercase tracking-widest text-xs rounded-full backdrop-blur-md">
                                {course.category || 'General'}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-lg">
                                {course.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
                                <span className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 border border-slate-700 shadow-inner"><User size={16} /></div> {course.instructor_name || 'Community Instructor'}</span>
                                <span className="flex items-center gap-2 text-slate-400"><BookOpen size={18} className="text-purple-400" /> {totalLessons} Modules</span>
                                <span className="flex items-center gap-2 text-slate-400"><Clock size={18} className="text-emerald-400" /> Self-paced</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-panel rounded-2xl p-8 md:p-10 border border-slate-800"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-indigo-500 rounded-full" /> About this course
                        </h2>
                        <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap font-tight">
                            {course.description || "No description provided for this premium course."}
                        </div>
                    </motion.section>

                    <motion.section 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="glass-panel rounded-2xl p-8 md:p-10 border border-slate-800"
                    >
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <div className="w-2 h-8 bg-purple-500 rounded-full" /> Course Syllabus
                        </h2>
                        {course.sections?.map((section, idx) => (
                            <div key={section.section_id} className="mb-8 last:mb-0">
                                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-4 mb-4">
                                    <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-sm border border-slate-700">{idx + 1}</span> 
                                    {section.title}
                                </h3>
                                <div className="space-y-3 pl-12 border-l-2 border-slate-800 ml-4 relative">
                                    {section.lessons?.map((lesson, lIdx) => (
                                        <div key={lesson.lesson_id} className="group flex items-center gap-4 p-4 bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all duration-300 relative before:w-6 before:h-px before:bg-slate-800 before:absolute before:-left-12 before:top-1/2">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(99,102,241,0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                                <PlayCircle size={18} />
                                            </div>
                                            <div>
                                                <span className="text-slate-200 font-medium block text-base group-hover:text-white transition-colors">{lesson.title}</span>
                                                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1 block">Video Lesson</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.section>
                </div>

                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="glass-panel rounded-2xl p-8 border border-slate-700 sticky top-28 shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
                        
                        <div className="text-4xl font-extrabold text-white mb-2 relative z-10">
                            {isEnrolled ? (
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Enrolled</span>
                            ) : (
                                isPaidCourse ? `₹${price.toFixed(0)}` : "Free"
                            )}
                        </div>
                        <p className="text-slate-400 mb-8 font-medium">Includes full lifetime access.</p>

                        {isEnrolled ? (
                            <AnimatedButton 
                                to={`/learn/${course.course_id}/${course.sections?.[0]?.lessons?.[0]?.lesson_id || ''}`} 
                                className="w-full py-4 text-base tracking-wide"
                                variant="primary"
                            >
                                Enter Course <PlayCircle size={20} className="ml-2" />
                            </AnimatedButton>
                        ) : user ? (
                            <AnimatedButton 
                                onClick={handleEnroll} 
                                disabled={enrolling} 
                                className="w-full py-4 text-base tracking-wide"
                                variant="primary"
                            >
                                {enrolling ? 'Enrolling...' : (isPaidCourse ? 'Unlock Course' : 'Enroll for Free')}
                            </AnimatedButton>
                        ) : (
                            <AnimatedButton 
                                to="/login" 
                                className="w-full py-4 text-base tracking-wide"
                                variant="secondary"
                            >
                                Sign In to Enroll
                            </AnimatedButton>
                        )}

                        <div className="space-y-4 mt-8 pb-4 relative z-10 text-slate-300 text-sm">
                            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800"><CheckCircle2 size={18} className="text-emerald-400" /> Full lifetime access</div>
                            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800"><CheckCircle2 size={18} className="text-emerald-400" /> Access on all devices</div>
                            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800"><CheckCircle2 size={18} className="text-emerald-400" /> Certificate of completion</div>
                            <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800"><CheckCircle2 size={18} className="text-emerald-400" /> Support via community</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                courseTitle={course.title}
                price={course.price}
                onComplete={handlePaymentComplete}
            />
        </div>
    );
};

export default CourseDetails;
