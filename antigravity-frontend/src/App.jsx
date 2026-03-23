import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PremiumNavbar from './components/layout/PremiumNavbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InstructorDash from './pages/InstructorDash';
import CourseListing from './pages/CourseListing';
import CourseDetails from './pages/CourseDetails';
import LearnPage from './pages/LearnPage';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AIChatbot from './components/AIChatbot';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-[#030712] font-sans selection:bg-indigo-500/30">
                    <PremiumNavbar />
                    {/* The padding top prevents content from hiding behind the fixed navbar */}
                    <main className="pt-20">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/courses" element={<CourseListing />} />
                            <Route path="/courses/:id" element={<CourseDetails />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="/instructor" element={
                                <ProtectedRoute roles={['instructor', 'admin']}>
                                    <InstructorDash />
                                </ProtectedRoute>
                            } />

                            <Route path="/learn/:courseId" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <LearnPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/learn/:courseId/:lessonId" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <LearnPage />
                                </ProtectedRoute>
                            } />

                            <Route path="/profile" element={
                                <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                        </Routes>
                        <AIChatbot />
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
