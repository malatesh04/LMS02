import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Edit, Trash2, Users, BookOpen, ChevronRight, Mail, Calendar, Loader2, UserCheck, GraduationCap } from 'lucide-react';

const InstructorDash = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('courses');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        thumbnail_url: '',
        price: 0,
        lessons: []
    });
    const [lessonInputs, setLessonInputs] = useState([{ title: '', youtube_url: '' }]);

    const fetchMyCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data.filter(c => c.instructor_id === user?.user_id || user?.role === 'admin'));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            // Use instructor-specific endpoint instead of admin
            const res = await api.get('/instructor/students');
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        }
        setStudentsLoading(false);
    };

    const fetchAllUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await api.get('/admin/users');
            setAllUsers(res.data);
        } catch (err) {
            console.error(err);
        }
        setUsersLoading(false);
    };

    const fetchStudentDetails = async (studentId) => {
        try {
            // Use instructor-specific endpoint
            const res = await api.get(`/instructor/students/${studentId}`);
            setStudentDetails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyCourses();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'students' && students.length === 0) {
            fetchStudents();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'users' && allUsers.length === 0) {
            fetchAllUsers();
        }
    }, [activeTab]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            // Create course first
            const courseRes = await api.post('/courses', {
                ...formData,
                is_published: true
            });

            const courseId = courseRes.data.course_id;

            // Create a section
            const sectionRes = await api.post(`/courses/${courseId}/sections`, {
                title: 'Main Modules',
                order_number: 1
            });

            const sectionId = sectionRes.data.section_id;

            // Create lessons
            for (let i = 0; i < lessonInputs.length; i++) {
                if (lessonInputs[i].title && lessonInputs[i].youtube_url) {
                    await api.post(`/sections/${sectionId}/lessons`, {
                        title: lessonInputs[i].title,
                        youtube_url: lessonInputs[i].youtube_url,
                        order_number: i + 1,
                        description: 'Complete the lesson'
                    });
                }
            }

            setFormData({ title: '', description: '', category: '', thumbnail_url: '', price: 0, lessons: [] });
            setLessonInputs([{ title: '', youtube_url: '' }]);
            setShowCreateForm(false);
            fetchMyCourses();
            alert('Course created successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to create course: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchMyCourses();
        } catch (err) {
            console.error(err);
            alert('Failed to delete course');
        }
    };

    const handleUserStatus = async (userId, status) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { status });
            fetchAllUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to update user status: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchAllUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        fetchStudentDetails(student.user_id);
    };

    const handleRemoveStudentFromCourse = async (courseId, studentId) => {
        if (!window.confirm('Are you sure you want to remove this student from the course?')) return;
        try {
            await api.delete(`/enrollment/instructor/courses/${courseId}/students/${studentId}`);
            fetchStudentDetails(studentId);
            // Assuming this endpoint gets added later or we just mutate state locally 
        } catch (err) {
            console.error(err);
            alert('Failed to remove student');
        }
    };

    const addLessonInput = () => {
        setLessonInputs([...lessonInputs, { title: '', youtube_url: '' }]);
    };

    const removeLessonInput = (index) => {
        setLessonInputs(lessonInputs.filter((_, i) => i !== index));
    };

    const updateLessonInput = (index, field, value) => {
        const updated = [...lessonInputs];
        updated[index][field] = value;
        setLessonInputs(updated);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Instructor Dashboard</h1>
                    <p className="text-slate-400">Manage your courses and track enrolled students</p>
                </div>
                <button
                    onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        if (!showCreateForm) setActiveTab('courses');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
                >
                    <PlusCircle size={20} /> Create New Course
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'courses'
                        ? 'text-indigo-400'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <BookOpen size={18} />
                    My Courses
                    {activeTab === 'courses' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'students'
                        ? 'text-indigo-400'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <UserCheck size={18} />
                    Enrolled Students
                    {activeTab === 'students' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === 'users'
                        ? 'text-indigo-400'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Users size={18} />
                    All Users
                    {activeTab === 'users' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
                    )}
                </button>
            </div>

            {showCreateForm && activeTab === 'courses' && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8 max-h-[70vh] overflow-y-auto">
                    <h2 className="text-xl font-bold text-white mb-4">Create New Course</h2>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Course Title *</label>
                                <input required type="text" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Complete Python Bootcamp" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                <input type="text" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., Programming" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                            <textarea required rows="3" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe what students will learn..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Thumbnail URL</label>
                                <input type="url" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    value={formData.thumbnail_url} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                    placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Price (₹)</label>
                                <input type="number" min="0" className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                    placeholder="0 for free" />
                            </div>
                        </div>

                        {/* Lessons Section */}
                        <div className="border-t border-slate-700 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Course Lessons</h3>
                                <button type="button" onClick={addLessonInput} className="text-indigo-400 hover:text-indigo-300 text-sm">
                                    + Add Lesson
                                </button>
                            </div>
                            {lessonInputs.map((lesson, index) => (
                                <div key={index} className="flex gap-3 mb-3 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder={`Lesson ${index + 1} Title`}
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                                            value={lesson.title}
                                            onChange={e => updateLessonInput(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            placeholder="YouTube URL"
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                                            value={lesson.youtube_url}
                                            onChange={e => updateLessonInput(index, 'youtube_url', e.target.value)}
                                        />
                                    </div>
                                    {lessonInputs.length > 1 && (
                                        <button type="button" onClick={() => removeLessonInput(index)} className="text-red-400 hover:text-red-300 p-2">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => {
                                setShowCreateForm(false);
                                setLessonInputs([{ title: '', youtube_url: '' }]);
                            }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium">Create Course</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="text-indigo-400 animate-spin" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
                            <div className="text-slate-400 mb-4">You haven't created any courses yet.</div>
                            <button onClick={() => setShowCreateForm(true)} className="text-indigo-400 hover:text-indigo-300">
                                Create your first course
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
                                <div key={course.course_id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                                    <div className="h-40 relative">
                                        <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-slate-900/80 rounded px-2 py-1 text-xs font-medium text-indigo-400">
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </div>
                                        {course.price > 0 && (
                                            <div className="absolute bottom-2 right-2 bg-green-600 rounded px-2 py-1 text-xs font-bold text-white">
                                                ₹{course.price}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                                        <p className="text-slate-400 text-sm mb-2 line-clamp-2">{course.description}</p>
                                        <span className="text-xs text-indigo-400 mb-4">{course.category}</span>
                                        <div className="mt-auto flex justify-between items-center border-t border-slate-700 pt-4">
                                            <span className="text-xs text-slate-500">{new Date(course.created_at).toLocaleDateString()}</span>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteCourse(course.course_id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="flex gap-6">
                    <div className="flex-1">
                        {studentsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={32} className="text-indigo-400 animate-spin" />
                            </div>
                        ) : students.length === 0 ? (
                            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                                <UserCheck size={48} className="text-slate-600 mx-auto mb-4" />
                                <div className="text-slate-400">No students enrolled yet.</div>
                            </div>
                        ) : (
                            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-900/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Student</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Courses</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Joined</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-slate-300"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {students.map(student => (
                                            <tr
                                                key={student.user_id}
                                                className={`hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedStudent?.user_id === student.user_id ? 'bg-indigo-600/20' : ''}`}
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {student.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-white font-medium">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{student.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded text-sm font-medium">
                                                        {student.enrolled_courses}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-sm">
                                                    {new Date(student.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <ChevronRight size={18} className="text-slate-500 inline" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {selectedStudent && (
                        <div className="w-96 bg-slate-800 rounded-xl border border-slate-700 p-6 h-fit sticky top-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                                    {selectedStudent.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                                    <p className="text-slate-400 text-sm flex items-center gap-1">
                                        <Mail size={14} /> {selectedStudent.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                <Calendar size={14} />
                                Joined {new Date(selectedStudent.created_at).toLocaleDateString()}
                            </div>

                            <h4 className="text-lg font-bold text-white mb-4">Enrolled Courses</h4>

                            {studentDetails?.courses?.length > 0 ? (
                                <div className="space-y-3">
                                    {studentDetails.courses.map(course => (
                                        <div key={course.course_id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="text-white font-medium pr-2 truncate">{course.title}</h5>
                                                <div className="flex gap-2 items-center flex-shrink-0">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${course.payment_status === 'completed' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                                                        {course.payment_status === 'completed' ? 'Paid' : 'Pending'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveStudentFromCourse(course.course_id, selectedStudent.user_id);
                                                        }}
                                                        className="text-white hover:text-red-400 px-2 py-0.5 bg-red-600/20 hover:bg-red-600/40 rounded transition-colors text-xs"
                                                        title="Unenroll Student"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-slate-400">{course.category}</span>
                                                <span className="text-indigo-400">₹{course.price}</span>
                                            </div>
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                    <span>Progress</span>
                                                    <span>{course.lessons_completed || 0}/{course.total_lessons || 0}</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${course.total_lessons ? ((course.lessons_completed || 0) / course.total_lessons * 100) : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {course.last_watched_lesson && (
                                                <div className="mt-3 pt-3 border-t border-slate-700">
                                                    <div className="text-xs text-slate-500">Last watched</div>
                                                    <div className="text-sm text-slate-300 truncate">{course.last_watched_lesson}</div>
                                                    {course.last_watched_at && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {new Date(course.last_watched_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-400 text-sm">No course enrollments</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* All Users Tab */}
            {activeTab === 'users' && (
                <>
                    {usersLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="text-indigo-400 animate-spin" />
                        </div>
                    ) : allUsers.length === 0 ? (
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                            <Users size={48} className="text-slate-600 mx-auto mb-4" />
                            <div className="text-slate-400">No users registered yet.</div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Role</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Enrolled</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Created</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {allUsers.map(u => (
                                        <tr key={u.user_id} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === 'instructor' ? 'bg-orange-600' : 'bg-indigo-600'
                                                        }`}>
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-white font-medium">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'instructor'
                                                    ? 'bg-orange-600/20 text-orange-400'
                                                    : u.role === 'admin'
                                                        ? 'bg-red-600/20 text-red-400'
                                                        : 'bg-indigo-600/20 text-indigo-400'
                                                    }`}>
                                                    {u.role?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{u.enrolled_courses || 0} courses</td>
                                            <td className="px-4 py-3 text-slate-400 text-sm">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${u.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                                                        u.status === 'blocked' ? 'bg-red-600/20 text-red-400' :
                                                            u.status === 'held' ? 'bg-orange-600/20 text-orange-400' :
                                                                'bg-yellow-600/20 text-yellow-400'
                                                    }`}>
                                                    {u.status?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {u.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleUserStatus(u.user_id, 'approved')}
                                                            className="text-xs bg-green-600/80 hover:bg-green-700 text-white px-3 py-1.5 rounded transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {u.status === 'approved' && (
                                                        <button
                                                            onClick={() => handleUserStatus(u.user_id, 'held')}
                                                            className="text-xs bg-orange-600/80 hover:bg-orange-700 text-white px-3 py-1.5 rounded transition-colors"
                                                        >
                                                            Hold
                                                        </button>
                                                    )}
                                                    {u.status !== 'blocked' && (
                                                        <button
                                                            onClick={() => handleUserStatus(u.user_id, 'blocked')}
                                                            className="text-xs bg-red-600/80 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
                                                        >
                                                            Block
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteUser(u.user_id)}
                                                        className="text-xs bg-slate-700 hover:bg-slate-600 text-red-400 px-3 py-1.5 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default InstructorDash;
