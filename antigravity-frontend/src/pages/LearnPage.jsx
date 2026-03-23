import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import VideoPlayer from '../components/VideoPlayer';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Menu, Lock, PlayCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../components/ui/AnimatedButton';

const LearnPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [completedLessons, setCompletedLessons] = useState([]);
    const [progressPercent, setProgressPercent] = useState(0);
    const [resumeTime, setResumeTime] = useState(0);

    const fetchProgress = async () => {
        try {
            const progRes = await api.get(`/progress/${courseId}`);
            setCompletedLessons(progRes.data);
            const percRes = await api.get(`/progress/${courseId}/percentage`);
            setProgressPercent(percRes.data.percentage || 0);
        } catch (e) { }
    };

    useEffect(() => {
        const fetchCourseAndLesson = async () => {
            try {
                const courseRes = await api.get(`/courses/${courseId}/tree`);
                setCourse(courseRes.data);

                let targetLessonId = lessonId;
                if (!targetLessonId) {
                    targetLessonId = courseRes.data.sections?.[0]?.lessons?.[0]?.lesson_id;
                    if (targetLessonId) {
                        navigate(`/learn/${courseId}/${targetLessonId}`, { replace: true });
                        return;
                    }
                }

                if (targetLessonId) {
                    // Get lesson from course tree first
                    let lessonFromTree = null;
                    if (courseRes.data && courseRes.data.sections) {
                        for (const section of courseRes.data.sections) {
                            const found = section.lessons?.find(l => l.lesson_id === targetLessonId);
                            if (found) {
                                lessonFromTree = found;
                                break;
                            }
                        }
                    }

                    if (lessonFromTree) {
                        setCurrentLesson(lessonFromTree);
                        api.get(`/progress/videos/${targetLessonId}`)
                            .then(progRes => setResumeTime(progRes.data.last_position_seconds || 0))
                            .catch(() => { });
                    } else {
                        try {
                            const lessonRes = await api.get(`/lessons/${targetLessonId}`);
                            if (lessonRes.data) {
                                setCurrentLesson(lessonRes.data);
                                const progRes = await api.get(`/progress/videos/${targetLessonId}`);
                                setResumeTime(progRes.data.last_position_seconds || 0);
                            }
                        } catch (e) {
                            console.error('Lesson API failed:', e);
                        }
                    }
                }
            } catch (err) {
                if (err.response?.status === 402) {
                    setError('Payment required to access this course. Please complete enrollment.');
                } else if (err.response?.status === 403) {
                    setError('You are not enrolled in this course. Please enroll first.');
                } else if (err.response?.status === 404) {
                    setError('Course not found.');
                } else {
                    setError('Failed to load course: ' + (err.response?.data?.error || err.message));
                }
            }
            setLoading(false);
            api.get(`/progress/${courseId}`)
                .then(progRes => {
                    setCompletedLessons(progRes.data);
                    return api.get(`/progress/${courseId}/percentage`);
                })
                .then(percRes => setProgressPercent(percRes.data.percentage || 0))
                .catch(() => { });
        };
        fetchCourseAndLesson();
    }, [courseId, lessonId, navigate]);

    const handleProgress = async (seconds) => {
        if (!currentLesson?.lesson_id) return;
        try {
            await api.post(`/progress/${currentLesson.lesson_id}`, {
                course_id: courseId,
                last_position_seconds: seconds,
            });
        } catch (e) { }
    };

    const handleMarkComplete = async (seconds) => {
        if (!currentLesson?.lesson_id) return;
        try {
            await api.post(`/progress/${currentLesson.lesson_id}`, {
                course_id: courseId,
                last_position_seconds: seconds || 0,
                is_completed: true
            });
            fetchProgress();

            if (currentLesson.next_lesson_id) {
                navigate(`/learn/${courseId}/${currentLesson.next_lesson_id}`);
            }
        } catch (err) {
            console.error('Failed to mark complete');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">Loading curriculum...</p>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center max-w-2xl mx-auto mt-20 glass rounded-2xl border border-slate-700 shadow-2xl">
            <Lock size={64} className="text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-8 border-l-4 border-red-500/50 pl-4 py-2 bg-red-500/10 rounded-r-lg max-w-md mx-auto">{error}</p>
            <AnimatedButton to={`/courses/${courseId}`} variant="primary">
                Return to Course Overview
            </AnimatedButton>
        </div>
    );

    if (!currentLesson) return <div className="p-8 text-slate-400 text-center">Loading lesson data...</div>;

    const prevLessonId = currentLesson.previous_lesson_id;
    const nextLessonId = currentLesson.next_lesson_id;
    const isCompleted = completedLessons.some(id => String(id) === String(lessonId));

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-73px)] overflow-hidden bg-[#030712] relative">
            {/* Background Blur Effect */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

            <div className="md:hidden glass p-4 border-b border-slate-800 flex justify-between items-center z-20">
                <h2 className="text-white font-medium pl-2 truncate pr-4 text-sm">{course.title}</h2>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-indigo-400 hover:text-white p-2 rounded-lg bg-indigo-500/10 transition-colors">
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative z-10">
                <div className="w-full bg-black/90 aspect-video md:aspect-auto md:h-[60vh] lg:h-[70vh] relative shadow-2xl">
                     <VideoPlayer
                        youtubeUrl={currentLesson.youtube_url}
                        isLocked={currentLesson.locked}
                        startPositionSeconds={resumeTime}
                        onProgress={handleProgress}
                        onCompleted={handleMarkComplete}
                    />
                </div>

                <div className="p-6 md:p-10 lg:p-12 flex-1 max-w-5xl mx-auto w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10"
                    >
                        <div>
                            <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold mb-4 uppercase tracking-widest text-xs rounded-full">
                                {course.title}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">{currentLesson.title}</h1>
                        </div>

                        <button
                            onClick={() => handleMarkComplete(resumeTime)}
                            disabled={isCompleted}
                            className={`
                                font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3 whitespace-nowrap shadow-lg shrink-0
                                ${isCompleted 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default shadow-emerald-500/5' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                                }
                            `}
                        >
                            {isCompleted ? <CheckCircle size={22} className="text-emerald-400" /> : <Circle size={22} />} 
                            {isCompleted ? 'Completed' : 'Mark Complete'}
                        </button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-panel rounded-2xl p-8 border border-slate-800 mb-10"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-purple-400" /> Lesson Details
                        </h3>
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                            {currentLesson.description || 'Watch the video to master this concept. No additional reading material is provided for this specific lesson.'}
                        </div>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-slate-800 pb-12 gap-4">
                        {prevLessonId ? (
                            <Link to={`/learn/${courseId}/${prevLessonId}`} className="group flex items-center justify-center sm:justify-start gap-3 w-full sm:w-auto px-6 py-4 glass hover:bg-slate-800 rounded-xl transition-all text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600">
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                                <span className="font-semibold tracking-wide">Previous</span>
                            </Link>
                        ) : <div className="hidden sm:block"></div>}

                        {nextLessonId ? (
                            <Link to={`/learn/${courseId}/${nextLessonId}`} className="group flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto px-6 py-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl transition-all border border-indigo-500/20 hover:border-indigo-500/40">
                                <span className="font-semibold tracking-wide">Next Lesson</span> 
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link to="/dashboard" className="group flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/40">
                                <span className="font-semibold tracking-wide">Finish Course</span> 
                                <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="fixed md:static inset-y-0 right-0 w-80 lg:w-96 glass-panel border-l border-slate-800 overflow-y-auto custom-scrollbar shadow-2xl z-30 flex flex-col mt-[73px] md:mt-0 h-[calc(100vh-73px)]"
                    >
                        <div className="p-6 border-b border-slate-800/60 sticky top-0 backdrop-blur-xl bg-slate-900/60 z-10 shrink-0">
                            <h2 className="text-lg font-bold text-white line-clamp-2 leading-tight">{course.title}</h2>
                            <div className="mt-5">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    <span>Course Progress</span>
                                    <span className="text-indigo-400">{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                                         <div className="absolute inset-0 bg-white/20 w-full h-full pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 flex-1">
                            {course.sections?.map((section, sIdx) => (
                                <div key={section.section_id} className="mb-6">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-3 flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">{sIdx + 1}</span>
                                        {section.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {section.lessons?.map((lesson, lIdx) => {
                                            const isActive = lesson.lesson_id === lessonId;
                                            const isLessonCompleted = completedLessons.includes(lesson.lesson_id);

                                            return (
                                                <Link
                                                    key={lesson.lesson_id}
                                                    to={lesson.locked ? '#' : `/learn/${courseId}/${lesson.lesson_id}`}
                                                    onClick={(e) => {
                                                        if (lesson.locked) e.preventDefault();
                                                        else if (window.innerWidth < 768) setIsSidebarOpen(false);
                                                    }}
                                                    className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20' : lesson.locked ? 'opacity-50 cursor-not-allowed border border-transparent' : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50'}`}
                                                >
                                                    <div className="mt-0.5 shrink-0 relative flex items-center justify-center">
                                                        {isLessonCompleted ? (
                                                            <CheckCircle size={18} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                        ) : lesson.locked ? (
                                                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                                <Lock size={10} className="text-slate-500" />
                                                            </div>
                                                        ) : isActive ? (
                                                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                                                                <PlayCircle size={12} className="text-indigo-400" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-slate-500 transition-colors" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className={`font-medium block leading-snug ${isActive ? 'text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]' : isLessonCompleted ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                            {lIdx + 1}. {lesson.title}
                                                        </span>
                                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-semibold block">Video • {isActive ? 'Playing' : isLessonCompleted ? 'Watched' : lesson.locked ? 'Locked' : 'Available'}</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && window.innerWidth < 768 && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 mt-[73px]"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default LearnPage;
