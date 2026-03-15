import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import DashboardService from '../../services/DashboardService';

// Using simple SVG icons for a beautiful modern aesthetic
const icons = {
    book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
    library: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 7h6"></path><path d="M8 11h8"></path></svg>,
    gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>,
    ban: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>,
    trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>,
    dollar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    tag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
};

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>({
        totalBooks: 0,
        activeBooks: 0,
        discontinuedBooks: 0,
        prizesClaimedBooks: 0,
        totalAgents: 0,
        totalAmount: 0,
        collectionAmount: 0,
        upcomingAmount: 0,
        discontinuedAmount: 0,
        price: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await DashboardService.getStats();
                if (response.success && response.data) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    const dashboardData = [
        { id: 1, title: 'Active Books', value: `${stats.activeBooks}`, icon: icons.book, color: '#10b981', bg: '#ecfdf5' },
        { id: 2, title: 'Total Books', value: `${stats.totalBooks}`, icon: icons.library, color: '#3b82f6', bg: '#eff6ff' },
        { id: 3, title: 'Prizes Claimed Books', value: `${stats.prizesClaimedBooks}`, icon: icons.gift, color: '#f59e0b', bg: '#fffbeb' },
        { id: 4, title: 'Discontinued Books', value: `${stats.discontinuedBooks}`, icon: icons.ban, color: '#ef4444', bg: '#fef2f2' },
        { id: 5, title: 'Total Agents', value: `${stats.totalAgents}`, icon: icons.users, color: '#0ea5e9', bg: '#f0f9ff' },
        { id: 6, title: 'Total Amount', value: `₹${stats.totalAmount.toLocaleString()}`, icon: icons.dollar, color: '#14b8a6', bg: '#f0fdfa' },
        { id: 7, title: 'Collection Amount', value: `₹${stats.collectionAmount.toLocaleString()}`, icon: icons.wallet, color: '#6366f1', bg: '#eef2ff' },
        { id: 8, title: 'Upcoming Amount', value: `₹${stats.upcomingAmount.toLocaleString()}`, icon: icons.clock, color: '#f43f5e', bg: '#fff1f2' },
        { id: 9, title: 'Discontinued Amt', value: `₹${stats.discontinuedAmount.toLocaleString()}`, icon: icons.ban, color: '#9ca3af', bg: '#f3f4f6' },
        { id: 10, title: 'Price', value: `₹${stats.price}`, icon: icons.tag, color: '#84cc16', bg: '#f7fee7' },
    ];

    if (loading) {
        return (
            <div className="dashboard-container fade-in-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container fade-in-up">
            <div className="dashboard-header-modern">
                <div className="title-section">
                    <h2>Welcome back, Admin 👋</h2>
                    <p>Here's what's happening with your LuckyDraw campaigns today.</p>
                </div>
                <div className="quick-actions">
                    <button className="btn-secondary">Export Report</button>
                    <button className="btn-primary">+ New Campaign</button>
                </div>
            </div>

            <div className="glass-card-transparent">
                <div className="stats-grid">
                    {dashboardData.map((stat) => (
                        <div key={stat.id} className="stat-card modern-stat-card">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <h3>{stat.title}</h3>
                                <p className="stat-value" style={{ color: '#0f172a' }}>{stat.value}</p>
                            </div>
                            <div className="stat-decorative-line" style={{ backgroundColor: stat.color }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
