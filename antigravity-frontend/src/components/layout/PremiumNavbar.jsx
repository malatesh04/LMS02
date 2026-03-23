import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Search, User, LogOut, Bell, Menu, X, BookOpen, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../ui/AnimatedButton';
import logoImg from '../../assets/logo.png';

const PremiumNavbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [scrolled, setScrolled] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [loginTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header 
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
                scrolled || mobileMenuOpen 
                ? 'bg-[#030712]/80 backdrop-blur-xl border-slate-800/50 shadow-2xl' 
                : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group relative cursor-pointer z-50">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
                    <img 
                        src={logoImg} 
                        alt="Hell Paradise Logo" 
                        className="w-10 h-10 rounded-full object-cover shadow-lg relative z-10" 
                        onError={(e) => { 
                            e.target.style.display = 'none'; 
                            e.target.nextSibling.style.display = 'flex'; 
                        }} 
                    />
                    <div className="hidden w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 items-center justify-center shadow-lg relative z-10">
                        <span className="text-white font-bold text-lg">HP</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all tracking-tight">
                        Hell Paradise
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-1 bg-slate-900/50 rounded-full p-1 border border-slate-800/50 backdrop-blur-md">
                        <Link 
                            to="/courses" 
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                location.pathname.includes('/courses') ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                        >
                            Explore
                        </Link>
                        {user && (
                            <Link 
                                to={user.role === 'instructor' ? '/instructor' : '/dashboard'} 
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    location.pathname.includes('/dashboard') || location.pathname.includes('/instructor') ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-800" />

                    <div className="flex items-center gap-4">
                        {/* Interactive Search */}
                        <div className="relative flex items-center">
                            <AnimatePresence>
                                {searchExpanded && (
                                    <motion.input 
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 220, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        type="text" 
                                        placeholder="Search courses..."
                                        className="absolute right-10 bg-slate-900/80 border border-slate-700 text-white text-sm rounded-full px-4 py-2.5 focus:outline-none focus:border-indigo-500 shadow-xl backdrop-blur-md"
                                        autoFocus
                                        onBlur={() => setSearchExpanded(false)}
                                    />
                                )}
                            </AnimatePresence>
                            <button 
                                onClick={() => setSearchExpanded(!searchExpanded)}
                                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition-colors"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4 relative">
                                <div className="relative" onMouseLeave={() => setIsNotificationOpen(false)}>
                                    <button 
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className="text-slate-400 hover:text-white transition-colors relative"
                                    >
                                        <Bell size={20} />
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isNotificationOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-full pt-4 w-80 z-50 pointer-events-auto"
                                            >
                                                <div className="glass border border-slate-700 overflow-hidden rounded-2xl shadow-2xl">
                                                    <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
                                                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">1 New</span>
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    <div className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors flex gap-4 items-start cursor-pointer group">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                                            <User size={18} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white text-sm font-medium mb-1 truncate">Welcome, {user.name}!</h4>
                                                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">You successfully logged in to Hell Paradise. Let's continue learning!</p>
                                                            <p className="text-slate-500 text-[10px] mt-2 font-medium">{loginTime}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                <div className="relative" onMouseLeave={() => setProfileOpen(false)}>
                                    <button 
                                        className="flex items-center gap-2 outline-none"
                                        onMouseEnter={() => setProfileOpen(true)}
                                    >
                                        <div className="w-10 h-10 rounded-full border border-indigo-500/50 overflow-hidden relative group">
                                            {user?.profile_image_url ? (
                                                <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-300">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-full pt-4 w-64 z-50 pointer-events-auto"
                                            >
                                                <div className="glass border border-slate-700 overflow-hidden rounded-2xl py-2 shadow-2xl">
                                                    <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
                                                    <p className="text-white font-medium truncate">{user.name}</p>
                                                    <p className="text-slate-400 text-xs truncate bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 font-medium mt-0.5">{user.role.toUpperCase()}</p>
                                                </div>
                                                <div className="py-2">
                                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                                                        <User size={16} /> Profile Settings
                                                    </Link>
                                                    <Link to={user.role === 'instructor' ? '/instructor' : '/dashboard'} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                                                        <BookOpen size={16} /> My Learning
                                                    </Link>
                                                </div>
                                                <div className="border-t border-slate-700/50 mt-1 py-1">
                                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                                        <LogOut size={16} /> Sign out
                                                    </button>
                                                </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <AnimatedButton to="/login" variant="ghost">Sign In</AnimatedButton>
                                <AnimatedButton to="/signup" variant="primary">Get Started</AnimatedButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden text-slate-300 hover:text-white z-50 relative"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-[#030712] border-b border-slate-800 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-4">
                            <Link to="/courses" className="text-slate-300 font-medium py-2 border-b border-slate-800/50" onClick={() => setMobileMenuOpen(false)}>Explore Courses</Link>
                            {user ? (
                                <>
                                    <Link to={user.role === 'instructor' ? '/instructor' : '/dashboard'} className="text-slate-300 font-medium py-2 border-b border-slate-800/50" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/profile" className="text-slate-300 font-medium py-2 border-b border-slate-800/50" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-red-400 font-medium py-2 text-left">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-slate-300 font-medium py-2 border-b border-slate-800/50" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                                    <Link to="/signup" className="text-indigo-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default PremiumNavbar;
