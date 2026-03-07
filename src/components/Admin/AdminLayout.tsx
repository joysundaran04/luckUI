import React from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import User from '../User/User';
import Book from '../Book/Book';
import Dashboard from '../Dashboard/Dashboard';
import Winners from '../Winners/Winners';
import Footer from '../Footer/Footer';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        navigate('/');
    };

    const pathParts = location.pathname.split('/');
    const currentPath = pathParts[pathParts.length - 1];
    const activeItem = currentPath === 'admin' ? 'dashboard' : currentPath;

    return (
        <div className="admin-layout">
            <Sidebar onLogout={handleLogout} activeItem={activeItem} setActiveItem={(item) => navigate(`/admin/${item}`)} />

            <main className="admin-main">
                <header className="admin-header">
                    <h1>{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}</h1>
                    <div className="admin-user-profile">
                        <span className="user-avatar">{(localStorage.getItem('userName') || 'AD').substring(0, 2).toUpperCase()}</span>
                        <span className="user-name">{localStorage.getItem('userName') || 'Admin'}</span>
                    </div>
                </header>

                <div className="admin-content fade-in-up">
                    <div className="admin-content-wrapper fade-in-up">
                        <Routes>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="users" element={<User />} />
                            <Route path="book" element={<Book />} />
                            <Route path="winners" element={<Winners />} />
                            <Route path="/" element={<Navigate to="dashboard" replace />} />
                            <Route path="*" element={
                                <div className="glass-card blank-slate">
                                    <h2>{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Management</h2>
                                    <p>This section is under construction. More awesome features coming soon!</p>
                                </div>
                            } />
                        </Routes>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
};

export default AdminLayout;
