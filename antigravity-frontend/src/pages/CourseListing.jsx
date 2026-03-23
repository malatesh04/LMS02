import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { AuthContext } from '../context/AuthContext';
import { Search, X, Loader2, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseListing = () => {
    const { user } = React.useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [loginTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/courses');
                setCourses(res.data);
                setFilteredCourses(res.data);
            } catch (err) {
                console.error('Error fetching courses:', err);
            }
            setLoading(false);
        };
        fetchCourses();
    }, []);

    // Search functionality
    useEffect(() => {
        const searchCourses = async () => {
            if (!searchQuery.trim()) {
                setFilteredCourses(courses);
                return;
            }

            setSearching(true);
            try {
                const res = await api.get(`/courses/search?q=${encodeURIComponent(searchQuery)}`);
                setFilteredCourses(res.data);
            } catch (err) {
                const query = searchQuery.toLowerCase();
                const filtered = courses.filter(course =>
                    course.title.toLowerCase().includes(query) ||
                    course.description?.toLowerCase().includes(query) ||
                    course.category?.toLowerCase().includes(query) ||
                    course.instructor_name?.toLowerCase().includes(query)
                );
                setFilteredCourses(filtered);
            }
            setSearching(false);
        };

        const debounce = setTimeout(searchCourses, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, courses]);

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredCourses(courses);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="py-12 px-6 max-w-7xl mx-auto">
            {/* Welcome Notification Box */}
            {user && showWelcome && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 glass border border-indigo-500/20 rounded-2xl p-5 flex items-start sm:items-center justify-between gap-4 shadow-lg shadow-indigo-500/5 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <Bell size={24} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Welcome to Hell Paradise LMS, {user.name}!</h3>
                            <p className="text-slate-400 text-sm mt-1">Start exploring our premium, AI-curated courses below.</p>
                        </div>
                    </div>
                    <button onClick={() => setShowWelcome(false)} className="text-slate-500 hover:text-white transition-colors p-2 relative z-10">
                        <X size={20} />
                    </button>
                </motion.div>
            )}

            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Explore Courses</h1>
                    <p className="text-slate-400 text-lg">Discover top-quality paths and start mastering new skills today.</p>
                </div>
                <div className="relative max-w-md w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses, topics, instructors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 backdrop-blur-md border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xl"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
                <div className="mb-8 flex items-center justify-between bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-700/50">
                    <p className="text-slate-300">
                        {searching ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-indigo-400" /> Searching...
                            </span>
                        ) : (
                            <>Found <span className="text-indigo-400 font-bold mx-1">{filteredCourses.length}</span> courses for "<span className="text-white font-medium">{searchQuery}</span>"</>
                        )}
                    </p>
                    {filteredCourses.length > 0 && (
                        <button onClick={clearSearch} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Clear search</button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium animate-pulse">Loading premium library...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-32 glass rounded-2xl border border-slate-700">
                    <Search size={56} className="text-slate-600 mx-auto mb-6" />
                    <p className="text-slate-300 text-lg mb-3">No courses found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                    {searchQuery && (
                        <button onClick={clearSearch} className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                            View all courses
                        </button>
                    )}
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredCourses.map(course => <CourseCard key={course.course_id} course={course} />)}
                </motion.div>
            )}
        </div>
    );
};

export default CourseListing;
