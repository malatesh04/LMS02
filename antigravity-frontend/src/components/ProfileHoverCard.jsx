import React, { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';

const ProfileHoverCard = ({ user, onLogout }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Hover Card - appears on hover */}
            <div
                className={`absolute right-0 top-full mt-2 w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden transform transition-all duration-300 origin-top-right ${isHovered
                    ? 'opacity-100 scale-100 translate-y-0 visible'
                    : 'opacity-0 scale-95 -translate-y-2 invisible'
                    }`}
                style={{ zIndex: 9999 }}
            >
                {/* Card Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-900/50 to-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-4">
                        {/* Profile Image */}
                        <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-white flex items-center justify-center overflow-hidden flex-shrink-0">
                            {user?.profile_image_url ? (
                                <img
                                    src={user.profile_image_url}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon size={28} className="text-slate-400" />
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-lg truncate">
                                {user?.name || 'User'}
                            </h3>
                            <p className="text-orange-400 text-sm font-medium truncate">
                                {user?.role === 'instructor' ? 'ADVANCED INSTRUCTOR' : 'ADVANCED LEARNER'}
                            </p>
                            <p className="text-indigo-400 text-xs font-medium">
                                Batch 2026
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="px-4 py-3 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-blue-400 text-sm font-medium">Offline</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-slate-800/50">
                    <div className="flex gap-2">
                        <button
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
                            onClick={() => window.location.href = '/profile'}
                        >
                            <UserIcon size={16} />
                            View Profile
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors font-medium text-sm"
                            onClick={onLogout}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHoverCard;
