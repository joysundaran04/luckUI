import React, { useEffect, useState } from 'react';
import BookService from '../../services/BookService';
import Spinner from '../Spinner/Spinner';
import './Winners.css';

interface Winner {
    _id: string;
    bookNumber: string;
    name: string;
    phone: string;
    wonDate: string;
    wonMonth: string;
    prizeNumber: string;
}

const Winners: React.FC = () => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(false);
    const [monthFilter, setMonthFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [expandedWinnerId, setExpandedWinnerId] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setExpandedWinnerId(prev => prev === id ? null : id);
    };

    const AVAILABLE_MONTHS = [
        { value: '1', label: 'July 2026' },
        { value: '2', label: 'August 2026' },
        { value: '3', label: 'September 2026' },
        { value: '4', label: 'October 2026' },
        { value: '5', label: 'November 2026' },
        { value: '6', label: 'December 2026' },
        { value: '7', label: 'January 2027' },
        { value: '8', label: 'February 2027' },
        { value: '9', label: 'March 2027' },
        { value: '10', label: 'April 2027' }
    ];

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchWinners(currentPage, '', monthFilter);
        }, 300);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, monthFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [ monthFilter]);

    const fetchWinners = async (page: number = 1, search: string = '', month: string = '') => {
        try {
            setLoading(true);
            const response: any = await BookService.getWinners(page, 6, search, month);
            if (response.success) {
                setWinners(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalRecords(response.totalRecords || 0);
            } else if (Array.isArray(response)) {
                // Fallback for old API
                setWinners(response);
            }
        } catch (error) {
            console.error("Error fetching winners:", error);
        } finally {
            setLoading(false);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="winners-page fade-in-up">
            <div className="winners-header-actions" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>🏆 Monthly Winners</h2>
                    <span className="badge" style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '13px' }}>
                        {totalRecords} Total Winners
                    </span>
                </div>
                <div className="filter-group" style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="filter-label" style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Month</label>
                        <select
                            className="search-input"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            style={{ padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', minWidth: '150px', outline: 'none', background: '#fff', cursor: 'pointer' }}
                        >
                            <option value="">All Months</option>
                            {AVAILABLE_MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Input Removed via User Request */}
                </div>
            </div>

            <div className="winners-container">
                <div className="glass-card table-container desktop-only" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="books-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ background: '#fafaf9' }}>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Month</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Book No.</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Name</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Phone</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Won Date</th>
                                <th style={{ padding: '20px 24px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Prize Num</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><Spinner /></td></tr>
                            ) : winners.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No winners found matching your search.</td></tr>
                            ) : (
                                winners.map(winner => (
                                    <tr key={winner._id} style={{ transition: 'background 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '18px 24px', fontWeight: 600, borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                                            {winner.wonMonth || '—'}
                                        </td>
                                        <td style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ fontWeight: 700, color: '#334155' }}>#{winner.bookNumber}</span>
                                        </td>
                                        <td style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {winner.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{winner.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '18px 24px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{winner.phone}</td>
                                        <td style={{ padding: '18px 24px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>
                                            {winner.wonDate ? new Date(winner.wonDate).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                            {winner.prizeNumber ? (
                                                <span style={{ color: '#d97706', fontWeight: 600, background: '#fef3c7', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
                                                    Prize {winner.prizeNumber}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Accordion Style) */}
                <div className="mobile-only mobile-book-list">
                    {loading ? (
                        <div className="mobile-loading" style={{ textAlign: 'center', padding: '40px' }}><Spinner /></div>
                    ) : winners.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No winners found.</div>
                    ) : (
                        winners.map(winner => (
                            <div
                                key={winner._id}
                                className={`book-accordion-item ${expandedWinnerId === winner._id ? 'expanded' : ''}`}
                            >
                                <div className="accordion-header">
                                    <div className="header-main-info" onClick={() => toggleAccordion(winner._id)}>
                                        <div className="avatar-small book-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                                            {winner.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="name-details">
                                            <span className="customer-name">{winner.name}</span>
                                            <span className="book-number">#{winner.bookNumber}</span>
                                        </div>
                                    </div>
                                    <div className="header-status-info" onClick={(e) => { e.stopPropagation(); toggleAccordion(winner._id); }}>
                                        {winner.prizeNumber ? (
                                            <span style={{ color: '#d97706', fontWeight: 600, background: '#fef3c7', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
                                                Prize {winner.prizeNumber}
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                        <span className="chevron"></span>
                                    </div>
                                </div>

                                <div className="accordion-content">
                                    <div className="detail-row">
                                        <span className="label">Month:</span>
                                        <span className="value">{winner.wonMonth || '—'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Phone:</span>
                                        <span className="value">{winner.phone}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Won Date:</span>
                                        <span className="value">{winner.wonDate ? new Date(winner.wonDate).toLocaleDateString() : '—'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {winners.length > 0 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #f1f5f9', borderRadius: '12px', marginTop: '12px', boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)' }}>
                        <button
                            className="btn-pagination"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                        >
                            ← Prev
                        </button>
                        
                        <div className="page-numbers" style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.5)', padding: '3px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                                    disabled={page === '...'}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                                        background: currentPage === page ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                                        color: currentPage === page ? 'white' : '#64748b',
                                        fontSize: '12px', fontWeight: 600, cursor: page === '...' ? 'default' : 'pointer',
                                        boxShadow: currentPage === page ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn-pagination"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Winners;
