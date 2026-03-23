import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './ui/GlassCard';
import { Star, PlayCircle } from 'lucide-react';

const CourseCard = ({ course }) => {
    const price = parseFloat(course.price) || 0;

    return (
        <GlassCard delay={0.1} hoverEffect={true} className="h-full">
            <Link to={`/courses/${course.course_id}`} className="block relative group h-full flex flex-col">
                <div className="aspect-video w-full overflow-hidden relative bg-slate-800 rounded-t-2xl">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
                    
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md uppercase tracking-wider">
                        {course.category || 'General'}
                    </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative z-10 w-full h-full">
                    <div className="flex items-center gap-2 mb-3">
                        <Star size={14} className="text-orange-400 fill-orange-400" />
                        <span className="text-xs font-medium text-slate-300">New Release</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                        {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                        <div className="flex items-center flex-1 min-w-0 mr-4">
                            <div className="w-7 h-7 rounded-full bg-slate-700/80 border border-slate-600 text-slate-300 flex items-center justify-center flex-shrink-0 mr-2">
                                <span className="text-[10px] font-bold">{course.instructor_name?.charAt(0) || 'I'}</span>
                            </div>
                            <span className="text-xs font-medium text-slate-300 truncate">
                                {course.instructor_name || 'Instructor'}
                            </span>
                        </div>
                        <span className="text-base font-bold text-emerald-400 flex-shrink-0">
                            {price > 0 ? `₹${price.toFixed(0)}` : 'Free'}
                        </span>
                    </div>
                </div>
            </Link>
        </GlassCard>
    );
};

export default CourseCard;
