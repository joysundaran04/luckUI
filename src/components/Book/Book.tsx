import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ViewBook from './ViewBook';
import type { BookData } from './ViewBook';
import BookService from '../../services/BookService';
import AgentService from '../../services/AgentService';
import Spinner from '../Spinner/Spinner';
import './Book.css';

const Book: React.FC = () => {
    const [books, setBooks] = useState<BookData[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('searchName'); // searchName, searchPhone, searchBookNo
    const [statusFilter, setStatusFilter] = useState(''); // Active, Discontinued, Won, etc.
    const [agentFilter, setAgentFilter] = useState(''); // agentId
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<BookData | null>(null);
    const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editRefreshKey, setEditRefreshKey] = useState(0);

    const [formData, setFormData] = useState({
        bookNumber: '',
        name: '',
        phone: '',
        whatsappNumber: '',
        address: '',
        monthlyAmount: 500,
        contributionStatus: 'Active',
        luckyDrawStatus: 'NotDraw',
        agentId: '',
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: any = {};
            if (searchText) {
                params[searchType] = searchText;
            }
            if (statusFilter) {
                params.status = statusFilter;
            }
            if (agentFilter) {
                params.agentId = agentFilter;
            }
            fetchBooks(currentPage, params);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchText, searchType, statusFilter, agentFilter]);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await AgentService.getAgents();
                setAgents(response.data || []);
            } catch (err) {
                console.error("Failed to fetch agents", err);
            }
        };
        fetchAgents();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, searchType, statusFilter, agentFilter]);

    const fetchBooks = async (page: number = 1, searchParams: { searchName?: string; searchPhone?: string; searchBookNo?: string; status?: string; agentId?: string } = {}) => {
        try {
            setLoading(true);
            const response: any = await BookService.getBooks(page, 7, searchParams);
            console.log(response);
            setBooks((response.data || []).map((b: any, index: number) => ({
                ...b,
                bookId: b.bookId || b._id || `temp-id-${index}-${Date.now()}`
            })));
            setTotalPages(response.totalPages || 1);

        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleOpenModal = (book?: BookData) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                bookNumber: book.bookNumber,
                name: book.name,
                phone: book.phone,
                whatsappNumber: book.whatsappNumber || '',
                address: book.address || '',
                monthlyAmount: book.monthlyAmount,
                contributionStatus: book.contributionStatus,
                luckyDrawStatus: book.luckyDrawStatus,
                agentId: book.agentId ? (typeof book.agentId === 'object' ? (book.agentId as any)._id : book.agentId) : (book.agent ? (typeof book.agent === 'object' ? (book.agent as any)._id : book.agent) : ''),
            });
        } else {
            setEditingBook(null);
            setFormData({ bookNumber: '', name: '', phone: '', whatsappNumber: '', address: '', monthlyAmount: 500, contributionStatus: 'Active', luckyDrawStatus: 'NotDraw', agentId: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBook(null);
        setFormError(null);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    const executeDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            setLoading(true);
            await BookService.deleteBook(deleteConfirmId);
            fetchBooks(currentPage, { [searchType]: searchText, status: statusFilter, agentId: agentFilter });
            setDeleteConfirmId(null);
        } catch (error: any) {
            console.error("Error deleting book:", error);
            alert(error.response?.data?.message || 'Failed to delete book');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const agentValue = editingBook ? (editingBook.agentId || editingBook.agent || null) : null;

        if (formData.phone.length !== 10) {
            setFormError('Phone number must be exactly 10 digits');
            return;
        }
        if (formData.whatsappNumber && formData.whatsappNumber.length !== 10) {
            setFormError('WhatsApp number must be exactly 10 digits');
            return;
        }
        setFormError(null);

        if (editingBook) {
            setIsSubmitting(true);
            try {
                await BookService.updateBook(editingBook.bookId, {
                    ...formData,
                    contributionStatus: formData.contributionStatus,
                    agentId: formData.agentId || undefined
                });
                const updatedBooks = books.map(b => b.bookId === editingBook.bookId ? { ...b, ...formData, agentId: agents.find(a => a._id === formData.agentId) || agentValue } : b);
                setBooks(updatedBooks);
                if (selectedBook && selectedBook.bookId === editingBook.bookId) {
                    const updated = updatedBooks.find(b => b.bookId === editingBook.bookId);
                    if (updated) setSelectedBook(updated);
                }

                handleCloseModal();
                setEditRefreshKey(prev => prev + 1);
                
            } catch (error: any) {
                console.error("Error updating book:", error);
                alert(error.response?.data?.message || 'Failed to update book');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            try {
                await BookService.createBook({
                    bookNumber: formData.bookNumber,
                    name: formData.name,
                    phone: formData.phone,
                    whatsappNumber: formData.whatsappNumber,
                    address: formData.address,
                    contributionStatus: formData.contributionStatus,
                    agentId: formData.agentId || undefined
                });

                handleCloseModal();
                fetchBooks(currentPage, { [searchType]: searchText, status: statusFilter, agentId: agentFilter });
            } catch (error: any) {
                console.error("Error creating book:", error);
                alert(error.response?.data?.message || 'Failed to create book');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const togglePayment = (bookId: string, monthNumber: number) => {
        fetchBooks(currentPage, { [searchType]: searchText, status: statusFilter, agentId: agentFilter });
    };

    const handlePrizeUpdate = (bookId: string, data: { luckyDrawStatus: string; wonDate?: string; wonMonth?: number; prizeNumber?: string; prizeDistributionStatus?: string }) => {
        fetchBooks(currentPage, { [searchType]: searchText, status: statusFilter, agentId: agentFilter });
    };

    const toggleAccordion = (bookId: string) => {
        setExpandedBookId(expandedBookId === bookId ? null : bookId);
    };


    // Render the Edit modal (shared between list and detail view)
    const renderModal = (title: string) => (
        isModalOpen && createPortal(
            <div className="modal-overlay">
                <div className="modal-content glass-card wide-modal">
                    <h3>{title}</h3>
                    {formError && <div className="form-error-message">{formError}</div>}
                    <form onSubmit={handleSubmit} className="book-form">
                        <div className="form-row">
                            <div className="input-group">
                                <label>Book Number</label>
                                <input
                                    type="text"
                                    value={formData.bookNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, bookNumber: val });
                                    }}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Customer Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, phone: val });
                                    }}
                                    placeholder="10-digit mobile number"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Agent</label>
                                <select value={formData.agentId} onChange={e => setFormData({ ...formData, agentId: e.target.value })}>
                                    <option value="">No Agent</option>
                                    {agents.map(agent => (
                                        <option key={agent._id} value={agent._id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>WhatsApp Number</label>
                                <input
                                    type="tel"
                                    value={formData.whatsappNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, whatsappNumber: val });
                                    }}
                                    placeholder="10-digit WhatsApp number"
                                />
                            </div>
                            <div className="input-group">
                                <label>Address</label>
                                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Book Status</label>
                                <select value={formData.contributionStatus} onChange={e => setFormData({ ...formData, contributionStatus: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Discontinued">Discontinued</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner /> : (editingBook ? 'Save Changes' : 'Create Book')}
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
                        <h3>Delete Book?</h3>
                        <p>This action cannot be undone. All payment records for this book will be permanently removed.</p>
                    </div>
                    <div className="modal-actions full-width">
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

    // Detail View - delegated to ViewBook component
    if (selectedBook) {
        return (
            <>
                <ViewBook
                    book={selectedBook}
                    refreshKey={editRefreshKey}
                    onBack={() => setSelectedBook(null)}
                    onEdit={(book) => handleOpenModal(book)}
                    onDelete={handleDelete}
                    onTogglePayment={togglePayment}
                    onPrizeUpdate={handlePrizeUpdate}
                />
                {renderModal('Edit Book Details')}
            </>
        );
    }

    // List View
    return (
        <div className="book-management fade-in-up">
            <div className="book-header-actions">
                <div>
                    <h2>Book Management</h2>
                </div>
                <div className="header-controls">
                    <div className="filter-group">
                        <label className="filter-label">Search By</label>
                        <div className="search-group">
                            <select
                                className="search-type-select"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            >
                                <option value="searchName">Name</option>
                                <option value="searchPhone">Phone</option>
                                <option value="searchBookNo">Book No</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Type to search..."
                                className="search-input"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Book Status</label>
                        <select
                            className="status-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Discontinued">Discontinued</option>
                            <option value="Won">Won</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Agent</label>
                        <select
                            className="agent-filter-select"
                            value={agentFilter}
                            onChange={(e) => setAgentFilter(e.target.value)}
                        >
                            <option value="">All Agents</option>
                            {agents.map(agent => (
                                <option key={agent._id} value={agent._id}>{agent.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="header-button-group">
                        <button className="btn-primary add-book-btn" onClick={() => handleOpenModal()}>
                            <span>+</span> Add New Book
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card table-container desktop-only">
                <table className="book-table">
                    <thead>
                        <tr>
                            <th>Book No.</th>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Agent</th>
                            <th>Paid/Total</th>
                            <th>Draw Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '2rem 0' }}>
                                    <Spinner />
                                </td>
                            </tr>
                        ) : books.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="empty-state">No books found.</td>
                            </tr>
                        ) : (
                            books.map(book => (
                                <tr key={book.bookId}>
                                    <td><strong>#{book.bookNumber}</strong></td>
                                    <td>
                                        <div className="book-info-cell">
                                            <div className="avatar-small book-avatar">{book.name.charAt(0)}</div>
                                            <span className="book-name-text">{book.name}</span>
                                        </div>
                                    </td>
                                    <td>{book.phone}</td>
                                    <td>
                                        {book.agentId ? (typeof book.agentId === 'object' ? (book.agentId as any).name : book.agentId) : '—'}
                                    </td>
                                    <td>
                                        <div className="progress-cell">
                                            <span className="progress-text">{book?.summary?.paidMonths || 0} / {book?.summary?.totalMonths || 0}</span>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill" style={{ width: `${((book?.summary?.paidMonths || 0) / (book?.summary?.totalMonths || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`draw-badge ${book.luckyDrawStatus.toLowerCase()}`}>
                                            {book.luckyDrawStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon view" onClick={() => setSelectedBook(book)} title="View & Manage Payments">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </button>
                                            <button className="btn-icon edit" onClick={() => handleOpenModal(book)} title="Edit">
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(book.bookId)} title="Delete">
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
                {loading ? (
                    <div className="mobile-loading">
                        <Spinner />
                    </div>
                ) : books.length === 0 ? (
                    <div className="empty-state">No books found.</div>
                ) : (
                    books.map(book => (
                        <div
                            key={book.bookId}
                            className={`book-accordion-item ${expandedBookId === book.bookId ? 'expanded' : ''}`}
                        >
                            <div className="accordion-header">
                                <div className="header-main-info" onClick={() => setSelectedBook(book)}>
                                    <div className="avatar-small book-avatar">{book.name.charAt(0)}</div>
                                    <div className="name-details">
                                        <span className="customer-name">{book.name}</span>
                                        <span className="book-number">#{book.bookNumber}</span>
                                    </div>
                                </div>
                                <div className="header-status-info" onClick={(e) => { e.stopPropagation(); toggleAccordion(book.bookId); }}>
                                    <span className={`draw-badge ${book.luckyDrawStatus.toLowerCase()}`}>
                                        {book.luckyDrawStatus}
                                    </span>
                                    <span className="chevron"></span>
                                </div>
                            </div>

                            <div className="accordion-content">
                                <div className="detail-row">
                                    <span className="label">Phone:</span>
                                    <span className="value">{book.phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Agent:</span>
                                    <span className="value">
                                        {book.agentId ? (typeof book.agentId === 'object' ? (book.agentId as any).name : book.agentId) : '—'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Paid/Total:</span>
                                    <div className="value">
                                        <div className="progress-cell">
                                            <span className="progress-text">{book?.summary?.paidMonths || 0} / {book?.summary?.totalMonths || 0}</span>
                                            <div className="progress-bar-bg">
                                                <div className="progress-bar-fill" style={{ width: `${((book?.summary?.paidMonths || 0) / (book?.summary?.totalMonths || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-actions">
                                    <button className="btn-mobile-action view" onClick={() => setSelectedBook(book)}>
                                        View Details
                                    </button>
                                    <button className="btn-mobile-action edit" onClick={() => handleOpenModal(book)}>
                                        Edit
                                    </button>
                                    <button className="btn-mobile-action delete" onClick={() => handleDelete(book.bookId)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="btn-pagination"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                        ← Prev
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`btn-page ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn-pagination"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                        Next →
                    </button>
                </div>
            )}

            {renderModal(editingBook ? 'Edit Book' : 'Add New Book')}
            {renderDeleteModal()}
        </div>
    );
};

export default Book;

