import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, User, LogOut, Bell } from 'lucide-react';
import ProfileHoverCard from './ProfileHoverCard';
import logoImg from '../assets/logo.png';

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const [loginTime] = React.useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
                    <img src={logoImg} alt="Hell Paradise Logo" className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <div className="hidden w-8 h-8 rounded bg-red-800 items-center justify-center">
                        <span className="text-white">HP</span>
                    </div>
                    Hell Paradise LMS
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/courses" className="text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
                        <BookOpen size={18} /> Explore
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to={user.role === 'instructor' ? '/instructor' : '/dashboard'} className="text-slate-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>

                            {/* Notifications Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="text-slate-300 hover:text-white transition-colors relative"
                                >
                                    <Bell size={18} />
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border-2 border-slate-900"></span>
                                    </span>
                                </button>

                                {/* Notification Box */}
                                {isNotificationOpen && (
                                    <div className="absolute right-0 top-full mt-4 w-80 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden z-50">
                                        <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                                            <h3 className="text-white font-bold text-sm">Notifications</h3>
                                            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">1 New</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            <div className="p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors flex gap-4 items-start cursor-pointer">
                                                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white text-sm font-medium mb-1">Welcome back, {user.name}!</h4>
                                                    <p className="text-slate-400 text-xs line-clamp-2">You successfully logged in to Hell Paradise LMS. Let's continue learning!</p>
                                                    <p className="text-slate-500 text-xs mt-2">{loginTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile with Hover Card */}
                            <div className="relative group">
                                <Link
                                    to="/profile"
                                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 font-medium transition-colors"
                                >
                                    <User size={18} /> {user.name}
                                </Link>
                                {/* Hover Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                                    {/* Card Header */}
                                    <div className="p-4 bg-gradient-to-r from-indigo-900/50 to-slate-800 border-b border-slate-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-white flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {user?.profile_image_url ? (
                                                    <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={28} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-lg truncate">{user?.name || 'User'}</h3>
                                                <p className="text-orange-400 text-sm font-medium truncate">{user?.role === 'instructor' ? 'ADVANCED INSTRUCTOR' : 'ADVANCED LEARNER'}</p>
                                                <p className="text-indigo-400 text-xs font-medium">Batch 2026</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Status */}
                                    <div className="px-4 py-3 border-b border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <span className="text-blue-400 text-sm font-medium">Offline</span>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="p-3 bg-slate-800/50 flex gap-2">
                                        <Link to="/profile" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm">
                                            <User size={16} /> View Profile
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors font-medium text-sm">
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
                            <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
