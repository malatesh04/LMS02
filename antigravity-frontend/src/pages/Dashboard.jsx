import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, PlayCircle, Award, Download, TrendingUp, Sparkles, BookMarked } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { motion } from 'framer-motion';

const CertificateModal = ({ course, user, onClose }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificate of Completion - ${course?.title || 'Course'}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Inter', sans-serif; 
                        background: #fff; 
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 40px;
                    }
                    .certificate {
                        width: 100%;
                        max-width: 800px;
                        border: 8px solid #6366f1;
                        padding: 60px;
                        text-align: center;
                        position: relative;
                    }
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        right: 20px;
                        bottom: 20px;
                        border: 2px solid #6366f1;
                        pointer-events: none;
                    }
                    .header { font-size: 14px; color: #6366f1; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; }
                    .title { font-family: 'Playfair Display', serif; font-size: 48px; color: #1e293b; margin-bottom: 10px; }
                    .subtitle { font-size: 18px; color: #64748b; margin-bottom: 40px; }
                    .recipient { font-family: 'Playfair Display', serif; font-size: 36px; color: #6366f1; margin-bottom: 20px; }
                    .course-label { font-size: 14px; color: #94a3b8; margin-bottom: 8px; }
                    .course-name { font-size: 24px; color: #1e293b; font-weight: 600; margin-bottom: 40px; }
                    .date { font-size: 14px; color: #94a3b8; }
                    .footer { margin-bottom: 0px; display: flex; justify-content: space-between; padding-top: 30px; border-top: 1px solid #e2e8f0; }
                    .signature { text-align: center; }
                    .signature-line { width: 200px; border-top: 1px solid #1e293b; margin-top: 8px; }
                    .badge { 
                        position: absolute; 
                        top: -20px; 
                        right: 40px; 
                        background: #6366f1; 
                        color: white; 
                        padding: 8px 20px; 
                        border-radius: 20px;
                        font-weight: 600;
                    }
                    @media print {
                        body { padding: 0; }
                        .certificate { border: 4px solid #6366f1; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="badge">COMPLETED</div>
                    <div class="header">Hell Paradise Learning</div>
                    <div class="title">Certificate of Completion</div>
                    <div class="subtitle">This is to certify that</div>
                    <div class="recipient">${user?.name || 'Student'}</div>
                    <div class="course-label">has successfully completed the course</div>
                    <div class="course-name">${course?.title || 'Course Name'}</div>
                    <div class="date">Issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div class="footer">
                        <div class="signature">
                            <div class="signature-line"></div>
                            <div>Course Instructor</div>
                        </div>
                        <div class="signature">
                            <div class="signature-line"></div>
                            <div>Platform Director</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Award className="text-amber-400" /> Certificate of Completion
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-full">&times;</button>
                </div>
                <div className="p-8 bg-white/5">
                    <div style={{ border: '8px solid #6366f1', padding: '40px', textAlign: 'center', position: 'relative', background: '#fff' }}>
                        <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '2px solid #6366f1', pointerEvents: 'none' }}></div>
                        <div style={{ fontSize: '12px', color: '#6366f1', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '15px' }}>HELL PARADISE LEARNING</div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: '#1e293b', marginBottom: '8px' }}>Certificate of Completion</div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px' }}>This is to certify that</div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#6366f1', marginBottom: '15px' }}>{user?.name || 'Student'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>has successfully completed the course</div>
                        <div style={{ fontSize: '18px', color: '#1e293b', fontWeight: '600', marginBottom: '30px' }}>{course?.title || 'Course Name'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4 justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors font-medium">Close</button>
                    <button onClick={handlePrint} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [certificateCourse, setCertificateCourse] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch enrolled courses
                const res = await api.get('/my-courses');
                const coursesData = res.data;

                const coursesWithProgress = await Promise.all(coursesData.map(async (course) => {
                    try {
                        const [progRes, lastLessonRes] = await Promise.all([
                            api.get(`/progress/${course.course_id}/percentage`),
                            api.get(`/progress/${course.course_id}/last-lesson`)
                        ]);
                        return {
                            ...course,
                            progress: progRes.data.percentage,
                            last_lesson_id: lastLessonRes.data.last_lesson_id
                        };
                    } catch (e) {
                        return { ...course, progress: 0, last_lesson_id: null };
                    }
                }));

                setMyCourses(coursesWithProgress);

                // Fetch all courses for fake "Recommended" and "Trending"
                const allRes = await api.get('/courses');
                setAllCourses(allRes.data);
                
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const handleUnenroll = async (courseId) => {
        if (window.confirm('Are you sure you want to drop this course? All progress will be lost.')) {
            try {
                await api.delete(`/enroll/${courseId}`);
                setMyCourses(myCourses.filter(c => c.course_id !== courseId));
            } catch (err) {
                console.error('Failed to unenroll', err);
                alert('Could not unenroll.');
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
    );

    // Filter logic for recommended: just randomly pick or slice ones not enrolled in
    const enrolledIds = new Set(myCourses.map(c => c.course_id));
    const nonEnrolled = allCourses.filter(c => !enrolledIds.has(c.course_id));
    const recommended = nonEnrolled.slice(0, 3);
    const trending = allCourses.slice(0, 3);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <>
            <div className="py-12 px-6 max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
                    <div>
                        <h1 className="text-4xl justify-center items-center md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">{user?.name}</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Pick up where you left off and accelerate your growth.</p>
                    </div>
                    <div className="glass px-6 py-4 rounded-xl flex items-center gap-6">
                        <div>
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Courses</p>
                            <p className="text-2xl font-bold text-white">{myCourses.length}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-700" />
                        <div>
                            <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Completed</p>
                            <p className="text-2xl font-bold text-emerald-400">{myCourses.filter(c => c.progress === 100).length}</p>
                        </div>
                    </div>
                </div>

                {/* Continue Learning Section */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <BookMarked className="text-indigo-400" size={28} />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Continue Learning</h2>
                    </div>

                    {myCourses.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center border border-slate-700">
                            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Your learning journey awaits</h3>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">You haven't enrolled in any courses yet. Discover our premium catalog and start building your skills.</p>
                            <AnimatedButton to="/courses" variant="primary">
                                Explore Catalog
                            </AnimatedButton>
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myCourses.map(course => (
                                <GlassCard key={course.course_id} hoverEffect={true} delay={0.1} className="h-full">
                                    <div className="flex flex-col h-full">
                                        <div className="h-44 relative overflow-hidden bg-slate-800 rounded-t-2xl group">
                                            <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                            {course.progress === 100 && (
                                                <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                                                    <Award size={14} className="text-emerald-400" />
                                                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Completed</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-6 flex-1 flex flex-col relative z-10 w-full h-full">
                                            <div className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-widest">{course.category || 'General'}</div>
                                            <h3 className="text-lg font-bold text-white mb-6 line-clamp-1">{course.title}</h3>

                                            <div className="mt-auto">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Mastery</span>
                                                    <span className={`text-sm font-bold ${course.progress === 100 ? 'text-emerald-400' : 'text-white'}`}>{course.progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-800/80 rounded-full h-2 mb-6 border border-slate-700 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out relative ${course.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                                        style={{ width: `${course.progress}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 w-full h-full pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/learn/${course.course_id}/${course.last_lesson_id || course.sections?.[0]?.lessons?.[0]?.lesson_id || ''}`}
                                                        className={`flex-1 flex justify-center items-center gap-2 font-medium py-2.5 rounded-lg border transition-all ${
                                                            course.progress === 100 
                                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                                        }`}
                                                    >
                                                        <PlayCircle size={18} /> {course.progress > 0 && course.progress < 100 ? 'Resume' : course.progress === 100 ? 'Review' : 'Start'}
                                                    </Link>
                                                    {course.progress === 100 && (
                                                        <button
                                                            onClick={() => setCertificateCourse(course)}
                                                            className="px-4 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium flex items-center justify-center hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                                            title="Download Certificate"
                                                        >
                                                            <Award size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUnenroll(course.course_id)}
                                                        className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all text-sm flex items-center justify-center"
                                                        title="Drop Course"
                                                    >
                                                        Drop
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </motion.div>
                    )}
                </section>

                {/* Recommended (Fake Dynamic) */}
                {recommended.length > 0 && (
                    <section className="mb-16 pt-10 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-8">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-purple-400" size={28} />
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Recommended for You</h2>
                                    <p className="text-slate-400 text-sm mt-1">Based on your role and recent activity</p>
                                </div>
                            </div>
                            <AnimatedButton to="/courses" variant="ghost" className="hidden sm:inline-flex">View More</AnimatedButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommended.map(course => (
                                <Link key={course.course_id} to={`/courses/${course.course_id}`} className="block group">
                                    <div className="glass hover:bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 flex gap-4 transition-all duration-300 group-hover:border-indigo-500/30">
                                        <div className="w-24 h-24 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><PlayCircle className="text-slate-600" /></div>
                                            )}
                                        </div>
                                        <div className="flex flex-col py-1">
                                            <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors mb-1">{course.title}</h4>
                                            <p className="text-slate-500 text-xs mb-auto">{course.instructor_name || 'Instructor'}</p>
                                            <span className="text-emerald-400 font-bold text-sm">{course.price > 0 ? `₹${parseFloat(course.price).toFixed(0)}` : 'Free'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending (Fake Dynamic) */}
                {trending.length > 0 && (
                    <section className="pt-10 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-emerald-400" size={28} />
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Trending Now</h2>
                                    <p className="text-slate-400 text-sm mt-1">Top rated paths in the community right now</p>
                                </div>
                            </div>
                            <AnimatedButton to="/courses" variant="ghost" className="hidden sm:inline-flex">View All</AnimatedButton>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {trending.map((course, idx) => (
                                <Link key={course.course_id} to={`/courses/${course.course_id}`} className="block group relative w-full border border-slate-700 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all duration-300">
                                    <div className="h-40 relative">
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                        <div className="absolute font-black text-6xl text-slate-100/10 italic bottom-[-10px] right-2 pointer-events-none">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-4">
                                        <h4 className="text-white font-bold line-clamp-1">{course.title}</h4>
                                        <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-1/3" />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Highly demanded</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {certificateCourse && (
                <CertificateModal
                    course={certificateCourse}
                    user={user}
                    onClose={() => setCertificateCourse(null)}
                />
            )}
        </>
    );
};

export default Dashboard;
