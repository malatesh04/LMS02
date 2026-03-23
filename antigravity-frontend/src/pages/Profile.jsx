import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Calendar, Shield, Hash } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="p-8 text-slate-400">Loading profile...</div>;

    const roleColors = {
        student: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/30',
        instructor: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
        admin: 'text-rose-400 bg-rose-400/10 border-rose-500/30'
    };

    return (
        <div className="py-12 px-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                <div className="h-32 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-800"></div>

                <div className="px-8 pb-8 relative">
                    <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-slate-800 flex items-center justify-center -mt-12 mb-4 shadow-lg">
                        <User size={48} className="text-slate-400" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                            <p className="text-slate-400 flex items-center gap-2">
                                <Mail size={16} /> {user.email}
                            </p>
                        </div>

                        <div>
                            <span className={`px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wider ${roleColors[user.role] || roleColors['student']}`}>
                                <Shield size={14} className="inline mr-2 -mt-1" />
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Hash size={16} /> User Identification
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Account ID</p>
                                    <p className="text-slate-300 font-mono text-sm break-all">{user.user_id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Calendar size={16} /> Account Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Member Since</p>
                                    <p className="text-slate-300">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
