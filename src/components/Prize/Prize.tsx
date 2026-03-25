import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import PrizeService from '../../services/PrizeService';
import Spinner from '../Spinner/Spinner';
import './Prize.css';

interface PrizeData {
    _id: string;
    prizeNumber: number;
    prizeName: string;
    priceDistributionStatus: string;
    monthName?: string;
    bookId?: { _id: string; bookNumber: string; phone: string } | null;
}

const wonMonthOptions = [
    { value: 'July 2026', label: 'July 2026' },
    { value: 'August 2026', label: 'August 2026' },
    { value: 'September 2026', label: 'September 2026' },
    { value: 'October 2026', label: 'October 2026' },
    { value: 'November 2026', label: 'November 2026' },
    { value: 'December 2026', label: 'December 2026' },
    { value: 'January 2027', label: 'January 2027' },
    { value: 'February 2027', label: 'February 2027' },
    { value: 'March 2027', label: 'March 2027' },
    { value: 'April 2027', label: 'April 2027' },
];

const Prize: React.FC = () => {
    const [prizes, setPrizes] = useState<PrizeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [monthFilter, setMonthFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrize, setEditingPrize] = useState<PrizeData | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedPrizeId, setExpandedPrizeId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        prizeNumber: '',
        prizeName: '',
        priceDistributionStatus: 'NotClaimed',
        monthName: '',
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPrizes(currentPage);
        }, 300);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, monthFilter, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [monthFilter, statusFilter]);

    const fetchPrizes = async (page: number = 1) => {
        try {
            setLoading(true);
            const params: any = {};
            if (monthFilter) params.monthName = monthFilter;
            if (statusFilter) params.status = statusFilter;

            const response: any = await PrizeService.getAllPrizes(page, 8, params);
            setPrizes(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotalRecords(response.totalRecords || 0);
        } catch (error) {
            console.error("Error fetching prizes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (prize?: PrizeData) => {
        if (prize) {
            setEditingPrize(prize);
            setFormData({
                prizeNumber: prize.prizeNumber.toString(),
                prizeName: prize.prizeName,
                priceDistributionStatus: prize.priceDistributionStatus || 'NotClaimed',
                monthName: prize.monthName || '',
            });
        } else {
            setEditingPrize(null);
            setFormData({ prizeNumber: '', prizeName: '', priceDistributionStatus: 'NotClaimed', monthName: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPrize(null);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const executeDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            setLoading(true);
            await PrizeService.deletePrize(deleteConfirmId);
            fetchPrizes(currentPage);
            setDeleteConfirmId(null);
        } catch (error: any) {
            console.error("Error deleting prize:", error);
            toast.error(error.response?.data?.message || 'Failed to delete prize');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                prizeNumber: Number(formData.prizeNumber),
            };

            if (editingPrize) {
                await PrizeService.updatePrize(editingPrize._id, dataToSubmit);
            } else {
                await PrizeService.createPrize(dataToSubmit);
            }
            handleCloseModal();
            fetchPrizes(currentPage);
        } catch (error: any) {
            console.error("Error saving prize:", error);
            toast.error(error.response?.data?.message || 'Failed to save prize');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAccordion = (prizeId: string) => {
        setExpandedPrizeId(expandedPrizeId === prizeId ? null : prizeId);
    };

    const renderModal = () => (
        isModalOpen && createPortal(
            <div className="modal-overlay">
                <div className="modal-content glass-card">
                    <h3>{editingPrize ? 'Edit Prize' : 'Add New Prize'}</h3>
                    <form onSubmit={handleSubmit} className="prize-form">
                        <div className="input-group">
                            <label>Prize Number</label>
                            <input
                                type="number"
                                value={formData.prizeNumber}
                                onChange={e => setFormData({ ...formData, prizeNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Prize Name</label>
                            <input
                                type="text"
                                value={formData.prizeName}
                                onChange={e => setFormData({ ...formData, prizeName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Month Name</label>
                            <select
                                value={formData.monthName}
                                onChange={e => setFormData({ ...formData, monthName: e.target.value })}
                            >
                                <option value="">Select Month</option>
                                {wonMonthOptions.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner /> : (editingPrize ? 'Save Changes' : 'Create Prize')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        )
    );

    const renderDeleteModal = () => (
        deleteConfirmId && createPortal(
            <div className="modal-overlay">
                <div className="modal-content glass-card delete-modal">
                    <div className="delete-icon">🗑️</div>
                    <div className="delete-text">
                        <h3>Delete Prize?</h3>
                        <p>This action cannot be undone. The prize record will be permanently removed.</p>
                    </div>
                    <div className="modal-actions" style={{ justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                        <button className="btn-danger" onClick={executeDelete}>
                            {loading ? <Spinner /> : 'Delete Confirm'}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )
    );

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
        <div className="prize-management fade-in-up">
            <div className="prize-header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h2 style={{ lineHeight: 1.2 }}>Prize Management</h2>
                    <div className="prize-badge">{totalRecords} Prizes</div>
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="filter-group">
                        <label className="filter-label">Month</label>
                        <select
                            className="month-filter-select"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                        >
                            <option value="">All Months</option>
                            {wonMonthOptions.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Status</label>
                        <select
                            className="status-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="NotClaimed">Not Claimed</option>
                            <option value="Distributed">Distributed</option>
                            <option value="Claimed">Claimed</option>
                        </select>
                    </div>
                    <div className="filter-group" style={{ justifyContent: 'flex-end', paddingBottom: '2px' }}>
                        <button className="btn-primary" onClick={() => handleOpenModal()}>
                            <span>+</span> Add Prize
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card table-container desktop-only">
                <table className="prize-table">
                    <thead>
                        <tr>
                            <th>Prize No.</th>
                            <th>Prize Name</th>
                            <th>Month Name</th>
                            <th>Associated Book</th>
                            <th>Distribution Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && prizes.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem 0', textAlign: 'center' }}>
                                    <Spinner />
                                </td>
                            </tr>
                        ) : prizes.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    No prizes found.
                                </td>
                            </tr>
                        ) : (
                            prizes.map((prize: any) => (
                                <tr key={prize._id}>
                                    <td><strong>#{prize.prizeNumber}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontWeight: 500 }}>{prize.prizeName}</span>
                                        </div>
                                    </td>
                                    <td>{prize.monthName || '—'}</td>
                                    <td>
                                        {prize.bookId ? (
                                            <span style={{ color: '#64748b' }}>
                                                Book #{prize.bookId.bookNumber}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${prize.priceDistributionStatus?.toLowerCase() || 'pending'}`}>
                                            {prize.priceDistributionStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn-icon edit" onClick={() => handleOpenModal(prize)} title="Edit">
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(prize._id)} title="Delete">
                                                ×
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Accordion Style) */}
            <div className="mobile-only mobile-book-list">
                {loading && prizes.length === 0 ? (
                    <div className="mobile-loading">
                        <Spinner />
                    </div>
                ) : prizes.length === 0 ? (
                    <div className="empty-state">No prizes found.</div>
                ) : (
                    prizes.map((prize: any) => (
                        <div
                            key={prize._id}
                            className={`book-accordion-item ${expandedPrizeId === prize._id ? 'expanded' : ''}`}
                        >
                            <div className="accordion-header">
                                <div className="header-main-info" onClick={() => toggleAccordion(prize._id)}>
                                    <div className="avatar-small book-avatar" style={{ background: '#3b82f6', color: 'white' }}>
                                        {prize.prizeName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="name-details">
                                        <span className="customer-name">{prize.prizeName}</span>
                                        <span className="book-number">#{prize.prizeNumber}</span>
                                    </div>
                                </div>
                                <div className="header-status-info" onClick={(e) => { e.stopPropagation(); toggleAccordion(prize._id); }}>
                                    <span className={`status-badge ${prize.priceDistributionStatus?.toLowerCase() || 'pending'}`}>
                                        {prize.priceDistributionStatus}
                                    </span>
                                    <span className="chevron"></span>
                                </div>
                            </div>

                            <div className="accordion-content">
                                <div className="detail-row">
                                    <span className="label">Month:</span>
                                    <span className="value">{prize.monthName || '—'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Book No:</span>
                                    <span className="value">
                                        {prize.bookId ? `#${prize.bookId.bookNumber}` : '—'}
                                    </span>
                                </div>
                                <div className="accordion-actions" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <button className="btn-mobile-action edit" onClick={() => handleOpenModal(prize)}>
                                        Edit
                                    </button>
                                    <button className="btn-mobile-action delete" onClick={() => handleDelete(prize._id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {prizes.length > 0 && (
                <div className="pagination-controls">
                    <button
                        className="btn-pagination"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                    >
                        ← Prev
                    </button>

                    <div className="page-numbers">
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                className={`btn-page ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn-pagination"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                    >
                        Next →
                    </button>
                </div>
            )}

            {renderModal()}
            {renderDeleteModal()}
        </div>
    );
};

export default Prize;
