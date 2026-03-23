import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devToken, setDevToken] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setDevToken('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            // Show dev token if provided by backend (no email service configured yet)
            if (res.data.devResetToken) {
                setDevToken(res.data.devResetToken);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 border-t border-slate-800 py-12">
            <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Reset Password</h2>
                <p className="text-slate-400 text-center mb-8 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded p-3 mb-4 text-sm text-center">{error}</div>}
                {message && <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded p-3 mb-4 text-sm text-center">{message}</div>}

                {devToken && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 rounded p-4 mb-4 text-sm break-all">
                        <p className="font-bold mb-2">Development Notice:</p>
                        <p className="mb-2">Email system not configured. Use this link directly to reset:</p>
                        <Link to={`/reset-password/${devToken}`} className="underline hover:text-yellow-400">
                            Reset Link
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Remember your password? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
