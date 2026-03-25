import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import BookService from '../../services/BookService';
import Spinner from '../Spinner/Spinner';
import './ViewBook.css';

interface Payment {
    monthNumber: number;
    monthName?: string;
    paid: boolean;
    amount: number;
    _id: string;
    paidDate?: string;
}

interface Summary {
    totalMonths: number;
    paidMonths: number;
    remainingMonths: number;
    totalPaidAmount: number;
    remainingAmount: number;
    eligibleForDraw: boolean;
}

export interface BookData {
    bookId: string;
    bookNumber: string;
    name: string;
    phone: string;
    whatsappNumber?: string;
    address?: string;
    monthlyAmount: number;
    contributionStatus: string;
    luckyDrawStatus: string;
    wonDate?: string;
    wonMonth?: number;
    prizeNumber?: string;
    priceDistributionStatus?: string;
    agent?: { _id: string; name: string; phone: string; mobileNumber?: string } | null;
    agentId?: { _id: string; name: string } | string | null;
    summary: Summary;
    payments: Payment[];
}

interface ViewBookProps {
    book: any;
    refreshKey?: number;
    onBack: () => void;
    onEdit: (book: BookData) => void;
    onDelete: (id: string) => void;
    onTogglePayment: (bookId: string, monthNumber: number) => void;
    onPrizeUpdate: (bookId: string, data: { luckyDrawStatus: string; wonDate?: string; wonMonth?: number; prizeNumber?: string; priceDistributionStatus?: string }) => void;
}

const wonMonthOptions = [
    { value: 1, label: 'July 2026' },
    { value: 2, label: 'August 2026' },
    { value: 3, label: 'September 2026' },
    { value: 4, label: 'October 2026' },
    { value: 5, label: 'November 2026' },
    { value: 6, label: 'December 2026' },
    { value: 7, label: 'January 2027' },
    { value: 8, label: 'February 2027' },
    { value: 9, label: 'March 2027' },
    { value: 10, label: 'April 2027' }
];

const ViewBook: React.FC<ViewBookProps> = ({ book: initialBook, refreshKey, onBack, onEdit, onDelete, onTogglePayment, onPrizeUpdate }) => {
    const [bookDetails, setBookDetails] = useState<BookData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [prizeStatus, setPrizeStatus] = useState('');
    const [wonDate, setWonDate] = useState('');
    const [wonMonth, setWonMonth] = useState<number>(0);
    const [prizeNumber, setPrizeNumber] = useState('');
    const [prizeDistStatus, setPrizeDistStatus] = useState('Distribution');
    const [confirmPaymentMonth, setConfirmPaymentMonth] = useState<number | null>(null);
    const [isUpdatingPrize, setIsUpdatingPrize] = useState(false);
    const [isTogglingPayment, setIsTogglingPayment] = useState(false);
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchBookDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialBook.bookId]);

    // Re-fetch when parent signals an edit was completed
    useEffect(() => {
        if (refreshKey !== undefined && refreshKey > 0) {
            fetchBookDetails(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    const fetchBookDetails = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response: any = await BookService.getBookById(initialBook._id);
            if (response.success && response.data) {
                setBookDetails(response.data);
            }
        } catch (error) {
            console.error("Error fetching book details", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleTogglePaymentClick = (monthNumber: number) => {
        setConfirmPaymentMonth(monthNumber);
        setPaymentDate(new Date().toISOString().split('T')[0]);
    };

    const executeTogglePayment = async () => {
        if (!bookDetails || confirmPaymentMonth === null) return;
        setIsTogglingPayment(true);
        const monthNumber = confirmPaymentMonth;
        const payment = bookDetails.payments.find(p => p.monthNumber === monthNumber);

        if (!payment) {
            setConfirmPaymentMonth(null);
            return;
        }

        const isNowPaid = !payment.paid;

        try {
            const response = await BookService.togglePayment(bookDetails.bookId, monthNumber, {
                paid: isNowPaid,
                amount: isNowPaid ? bookDetails.monthlyAmount : 0,
                paidDate: isNowPaid ? paymentDate : undefined
            });
            if (response.success) {
                await fetchBookDetails(false);
                onTogglePayment(bookDetails.bookId, monthNumber); // Trigger list update
            }
        } catch (error: any) {
            console.error("Error toggling payment:", error);
            toast.error(error.response?.data?.message || 'Failed to update payment');
        } finally {
            setIsTogglingPayment(false);
            setConfirmPaymentMonth(null);
        }
    };

 

    const handlePrizeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        debugger
        if (!bookDetails) return;
        setIsUpdatingPrize(true);
        const isWon = prizeStatus === 'Won';
        const dateValue = wonDate ? new Date(wonDate).toISOString() : undefined;
        const updateData = {
            luckyDrawStatus: prizeStatus,
            wonDate: isWon ? dateValue : undefined,
            wonMonth: isWon ? wonMonth : undefined,
            prizeNumber: prizeNumber || undefined,
            contributionStatus: "Completed",
            priceDistributionStatus: prizeDistStatus,
        };
        try {
            const response = await BookService.updatePrize(bookDetails.bookId, {
                ...updateData,
            });
            if (response.success) {
                await fetchBookDetails(false);
                onPrizeUpdate(bookDetails.bookId, updateData);
                setShowPrizeModal(false);
            }
        } catch (error: any) {
            console.error("Error updating prize:", error);
            toast.error(error.response?.data?.message || 'Failed to update prize');
        } finally {
            setIsUpdatingPrize(false);
        }
    };

    const openPrizeModal = () => {
        if (!bookDetails) return;
        setPrizeStatus(bookDetails.luckyDrawStatus || 'NotDraw');
        setWonDate(bookDetails.wonDate ? bookDetails.wonDate.split('T')[0] : '');
        setWonMonth(Number(bookDetails.wonMonth) || 0);
        setPrizeNumber(bookDetails.prizeNumber || '');
        setPrizeDistStatus(bookDetails.priceDistributionStatus || 'Pending');
        setShowPrizeModal(true);
    };

    if (loading || !bookDetails) {
        return (
            <div className="book-details-view fade-in-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <Spinner />
            </div>
        );
    }

    const book = bookDetails;

    return (
        <div className="book-details-view fade-in-up">
            <div className="book-header-actions">
                <button className="btn-secondary back-btn" onClick={onBack}>
                    Back
                </button>
                <div className="details-actions">
                    <button className="btn-prize" onClick={openPrizeModal}>
                        🏆 Prize Update
                    </button>
                    <button className="btn-secondary edit-btn" onClick={() => onEdit(book)}>
                        Edit Details
                    </button>
                </div>
            </div>

            {confirmPaymentMonth !== null && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-card confirm-modal">
                        <div className="confirm-modal-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <h3>Confirm Update</h3>
                            <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
                                Are you sure you want to mark {bookDetails?.payments.find(p => p.monthNumber === confirmPaymentMonth)?.monthName || `Month ${confirmPaymentMonth}`} as <strong>{bookDetails?.payments.find(p => p.monthNumber === confirmPaymentMonth)?.paid ? 'Unpaid' : 'Paid'}</strong>?
                            </p>
                            {!bookDetails?.payments.find(p => p.monthNumber === confirmPaymentMonth)?.paid && (
                                <div style={{ marginTop: '15px', textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Payment Date:</label>
                                    <input 
                                        type="date" 
                                        value={paymentDate} 
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setConfirmPaymentMonth(null)} disabled={isTogglingPayment}>Cancel</button>
                            <button type="button" className="btn-prize-submit" style={{ background: '#4CAF50' }} onClick={executeTogglePayment} disabled={isTogglingPayment}>
                                {isTogglingPayment ? <Spinner /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showPrizeModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-card prize-modal">
                        <div className="prize-modal-header">
                            <div className="prize-trophy-icon">🏆</div>
                            <div>
                                <h3>Update Prize</h3>
                                <p className="prize-modal-sub">Book #{book.bookNumber} • {book.name}</p>
                            </div>
                            <button className="prize-close-btn" onClick={() => setShowPrizeModal(false)}>×</button>
                        </div>

                        {/* Distribution Stats */}
                        {/* <div className="prize-stats-row">
                            <div className="prize-stat-card">
                                <div className="prize-stat-ring">
                                    <svg viewBox="0 0 36 36" className="circular-chart">
                                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle-fill" strokeDasharray={`${(book.summary.paidMonths / book.summary.totalMonths) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <span className="ring-text">{book.summary.paidMonths}/{book.summary.totalMonths}</span>
                                </div>
                                <div className="prize-stat-info">
                                    <span className="prize-stat-label">Months Paid</span>
                                    <span className="prize-stat-val">{book.summary.paidMonths} of {book.summary.totalMonths}</span>
                                </div>
                            </div>
                            <div className="prize-stat-card">
                                <div className="prize-stat-amount success">₹{book.summary.totalPaidAmount}</div>
                                <span className="prize-stat-label">Total Paid</span>
                            </div>
                            <div className="prize-stat-card">
                                <div className="prize-stat-amount danger">₹{book.summary.remainingAmount}</div>
                                <span className="prize-stat-label">Remaining</span>
                            </div>
                        </div> */}

                        {/* <div className="prize-eligible-bar">
                            {book.summary.eligibleForDraw
                                ? <span className="el-bar yes">✓ Eligible for Lucky Draw</span>
                                : <span className="el-bar no">✗ Not Eligible for Lucky Draw</span>
                            }
                        </div> */}

                        <form onSubmit={handlePrizeSubmit} className="prize-form">
                            <div className="prize-form-fields">
                                <div className="prize-form-row">
                                    <div className="input-group">
                                        <label>Prize Number</label>
                                        <input type="text" placeholder="e.g. P-001" value={prizeNumber} onChange={e => setPrizeNumber(e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Distribution Status</label>
                                        <select value={prizeDistStatus} onChange={e => setPrizeDistStatus(e.target.value)}>
                                            <option value="Distributed">Distributed</option>
                                            <option value="Claimed">Claimed</option>
                                            <option value="NotClaimed">Not Claimed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="prize-form-row">
                                    <div className="input-group">
                                        <label>Lucky Draw Status</label>
                                        <select value={prizeStatus} onChange={e => setPrizeStatus(e.target.value)}>
                                            <option value="NotDraw">Not Draw</option>
                                            <option value="Won">Won</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Won Month</label>
                                        <select value={wonMonth} onChange={e => setWonMonth(Number(e.target.value))}>
                                            <option value={0}>Select Month</option>
                                            {wonMonthOptions.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {(prizeStatus === 'Won' || prizeStatus === 'Winner') && (
                                    <div className="input-group">
                                        <label>Won Date</label>
                                        <input type="date" value={wonDate} onChange={e => setWonDate(e.target.value)} required />
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowPrizeModal(false)}>Cancel</button>
                                <button type="submit" className="btn-prize-submit" disabled={isUpdatingPrize}>
                                    {isUpdatingPrize ? <Spinner /> : '🏆 Update Prize'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <div className="glass-card book-details-card">
                <div className="details-header">
                    <div className="avatar-large book-avatar">{book.name.charAt(0)}</div>
                    <div className="details-header-text">
                        <h2>{book.name}</h2>
                        <p className="book-subtitle">Book #{book.bookNumber}</p>
                    </div>
                    {book.wonDate && (
                        <div className="winner-badge">
                            🏆 Won on {new Date(book.wonDate).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-value">{book.phone}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">WhatsApp Number</span>
                        <span className="detail-value">{book.whatsappNumber || '—'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Agent</span>
                        <span className="detail-value">
                            {book.agent ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{book.agent.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{book.agent.phone}</span>
                                </div>
                            ) : '—'}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{book.address || '—'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Contribution Status</span>
                        <span className="detail-value">
                            <span className={`status-badge ${book.contributionStatus.toLowerCase()}`}>
                                {book.contributionStatus}
                            </span>
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Lucky Draw Status</span>
                        <span className="detail-value">
                            <span className={`draw-badge ${book.luckyDrawStatus.toLowerCase()}`}>
                                {book.luckyDrawStatus}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Prize Information Section */}
                <div className="prize-info-section">
                    <h3 className="section-title prize-section-title">🏆 Prize Information</h3>
                    <div className="prize-info-grid">
                        <div className="prize-info-card">
                            <span className="prize-info-icon">🎫</span>
                            <div className="prize-info-detail">
                                <span className="prize-info-label">Prize Number</span>
                                <span className="prize-info-value">{book.prizeNumber || '—'}</span>
                            </div>
                        </div>
                        <div className="prize-info-card">
                            <span className="prize-info-icon">📦</span>
                            <div className="prize-info-detail">
                                <span className="prize-info-label">Distribution Status</span>
                                <span className={`prize-dist-badge ${(book.priceDistributionStatus || 'pending').toLowerCase()}`}>
                                    {book.priceDistributionStatus}
                                </span>
                            </div>
                        </div>
                        <div className="prize-info-card">
                            <span className="prize-info-icon">📅</span>
                            <div className="prize-info-detail">
                                <span className="prize-info-label">Won Month</span>
                                <span className="prize-info-value">{book.wonMonth ? wonMonthOptions.find(o => o.value === Number(book.wonMonth))?.label || `Month ${book.wonMonth}` : '—'}</span>
                            </div>
                        </div>
                        <div className="prize-info-card">
                            <span className="prize-info-icon">🗓️</span>
                            <div className="prize-info-detail">
                                <span className="prize-info-label">Won Date</span>
                                <span className="prize-info-value">{book.wonDate ? new Date(book.wonDate).toLocaleDateString() : '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="summary-section">
                    <h3 className="section-title">Financial Summary</h3>
                    <div className="summary-grid">
                        <div className="summary-card">
                            <div className="summary-icon">💰</div>
                            <div className="summary-info">
                                <span className="summary-label">Monthly Amount</span>
                                <span className="summary-value">₹{book.monthlyAmount}</span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon success">✓</div>
                            <div className="summary-info">
                                <span className="summary-label">Total Paid ({book.summary.paidMonths}/{book.summary.totalMonths} months)</span>
                                <span className="summary-value success">₹{book.summary.totalPaidAmount}</span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon danger">⏳</div>
                            <div className="summary-info">
                                <span className="summary-label">Remaining ({book.summary.remainingMonths} months)</span>
                                <span className="summary-value danger">
                                    {(book.luckyDrawStatus === 'Winner' || book.luckyDrawStatus === 'Won') && book.contributionStatus === 'Completed' ? '—' : `₹${book.summary.remainingAmount}`}
                                </span>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon info">🎟️</div>
                            <div className="summary-info">
                                <span className="summary-label">Draw Eligibility</span>
                                <span className="summary-value">
                                    {book.summary.eligibleForDraw ? <span className="el-yes">Eligible</span> : <span className="el-no">Not Eligible</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="payments-section">
                    <h3 className="section-title">Payment Tracking</h3>
                    <div className="payments-list">
                        {book.payments?.map(payment => {
                            const isPaymentDisabled = book.luckyDrawStatus === 'Won' || book.contributionStatus === 'Discontinued' || book.luckyDrawStatus === 'Discontinued';
                            return (
                                <div key={payment._id || payment.monthNumber} className={`payment-row ${payment.paid ? 'paid' : 'unpaid'} ${isPaymentDisabled ? 'disabled' : ''}`}>
                                    <div className="payment-month">
                                        {payment.monthName || `Month ${payment.monthNumber}`}
                                    </div>
                                    <div className="payment-amount">
                                        {payment.paid ? `₹${payment.amount}` : `₹${book.monthlyAmount}`}
                                    </div>
                                    <div className="payment-date">
                                        {payment.paid && payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'Pending'}
                                    </div>
                                    <div className="payment-action">
                                        <button
                                            className={`toggle-payment-btn ${payment.paid ? 'btn-red' : 'btn-green'}`}
                                            onClick={() => handleTogglePaymentClick(payment.monthNumber)}
                                            disabled={isPaymentDisabled}
                                            style={{ opacity: isPaymentDisabled ? 0.5 : 1, cursor: isPaymentDisabled ? 'not-allowed' : 'pointer' }}
                                        >
                                            {payment.paid ? 'Mark Unpaid' : 'Mark Paid'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="details-footer">
                    <button className="btn-icon delete danger-btn" onClick={() => { onDelete(book.bookId); onBack(); }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete Book
                    </button>
                </div>
            </div>
        </div >
    );
};

export default ViewBook;
