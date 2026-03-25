import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import User from '../User/User';
import Book from '../Book/Book';
import Agent from '../Agent/Agent';
import Dashboard from '../Dashboard/Dashboard';
import Winners from '../Winners/Winners';
import Prize from '../Prize/Prize';
import Footer from '../Footer/Footer';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const handleLogout = () => {
        navigate('/');
    };

    const pathParts = location.pathname.split('/');
    const currentPath = pathParts[pathParts.length - 1];
    const activeItem = currentPath === 'admin' ? 'dashboard' : currentPath;

    return (
        <div className="admin-layout">
            <Sidebar 
                onLogout={handleLogout} 
                activeItem={activeItem} 
                setActiveItem={(item) => {
                    navigate(`/admin/${item}`);
                    setIsMobileSidebarOpen(false);
                }}
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <button 
                            className="mobile-menu-toggle" 
                            onClick={() => setIsMobileSidebarOpen(true)}
                            aria-label="Open Menu"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <h1>{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}</h1>
                    </div>
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
                            <Route path="agent" element={<Agent />} />
                            <Route path="book" element={<Book />} />
                            <Route path="winners" element={<Winners />} />
                            <Route path="prizes" element={<Prize />} />
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
