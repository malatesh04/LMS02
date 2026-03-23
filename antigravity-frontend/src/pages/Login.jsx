import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'instructor') {
                navigate('/instructor');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const serverError = err.response?.data?.error || 'Login failed';
            const details = err.response?.data?.details;
            setError(details ? `${serverError}: ${details}` : serverError);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 border-t border-slate-800">
            <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Welcome Back</h2>
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded p-3 mb-4 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                        Sign In
                    </button>
                    <div className="text-center mt-4">
                        <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-indigo-300">Forgot your password?</Link>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
