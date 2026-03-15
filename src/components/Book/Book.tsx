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
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchBookNo, setSearchBookNo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<BookData | null>(null);
    const [selectedBook, setSelectedBook] = useState<BookData | null>(null);

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
            fetchBooks(currentPage, { searchName, searchPhone, searchBookNo });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchName, searchPhone, searchBookNo]);

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
    }, [searchName, searchPhone, searchBookNo]);

    const fetchBooks = async (page: number = 1, searchParams: { searchName?: string; searchPhone?: string; searchBookNo?: string } = {}) => {
        try {
            setLoading(true);
            const response: any = await BookService.getBooks(page, 7, searchParams);
            console.log(response);
            setBooks(response.data);
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
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            setBooks(books.filter(b => b.bookId !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const agentValue = editingBook ? (editingBook.agentId || editingBook.agent || null) : null;

        if (editingBook) {
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
            } catch (error: any) {
                console.error("Error updating book:", error);
                alert(error.response?.data?.message || 'Failed to update book');
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
                fetchBooks(currentPage, { searchName, searchPhone, searchBookNo });
            } catch (error: any) {
                console.error("Error creating book:", error);
                alert(error.response?.data?.message || 'Failed to create book');
            }
        }
    };

    const togglePayment = (bookId: string, monthNumber: number) => {
        fetchBooks(currentPage, { searchName, searchPhone, searchBookNo });
    };

    const handlePrizeUpdate = (bookId: string, data: { luckyDrawStatus: string; wonDate?: string; wonMonth?: number; prizeNumber?: string; prizeDistributionStatus?: string }) => {
        fetchBooks(currentPage, { searchName, searchPhone, searchBookNo });
    };

    // const filteredBooks = books.filter(book => {
    //     const matchName = book.name ? book.name.toLowerCase().includes(searchName.toLowerCase()) : true;
    //     const matchPhone = book.phone ? book.phone.toLowerCase().includes(searchPhone.toLowerCase()) : true;
    //     const matchBookNo = book.bookNumber ? book.bookNumber.toLowerCase().includes(searchBookNo.toLowerCase()) : true;

    //     return matchName && matchPhone && matchBookNo;
    // });

    // Render the Edit modal (shared between list and detail view)
    const renderModal = (title: string) => (
        isModalOpen && createPortal(
            <div className="modal-overlay">
                <div className="modal-content glass-card wide-modal">
                    <h3>{title}</h3>
                    <form onSubmit={handleSubmit} className="book-form">
                        <div className="form-row">
                            <div className="input-group">
                                <label>Book Number</label>
                                <input type="text" value={formData.bookNumber} onChange={e => setFormData({ ...formData, bookNumber: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Customer Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
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
                                <input type="tel" value={formData.whatsappNumber} onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })} />
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
                            <button type="submit" className="btn-primary">{editingBook ? 'Save Changes' : 'Create Book'}</button>
                        </div>
                    </form>
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
                    <input
                        type="text"
                        placeholder="Search Name..."
                        className="search-input"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Search Phone..."
                        className="search-input"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Search Book No..."
                        className="search-input"
                        value={searchBookNo}
                        onChange={(e) => setSearchBookNo(e.target.value)}
                    />
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Add New Book
                    </button>
                </div>
            </div>

            <div className="glass-card table-container">
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
                                <td colSpan={6} style={{ padding: '2rem 0' }}>
                                    <Spinner />
                                </td>
                            </tr>
                        ) : books.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="empty-state">No books found.</td>
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
        </div>
    );
};

export default Book;

