import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ViewBook from './ViewBook';
import type { BookData } from './ViewBook';
import BookService from '../../services/BookService';
import Spinner from '../Spinner/Spinner';
import './Book.css';

interface Payment {
    monthNumber: number;
    paid: boolean;
    amount: number;
    _id: string;
    paidDate?: string;
}

const mockPayments: Payment[] = [
    { monthNumber: 1, paid: true, amount: 500, _id: "p1", paidDate: "2026-02-28T13:41:39.051Z" },
    { monthNumber: 2, paid: true, amount: 500, _id: "p2", paidDate: "2026-02-28T13:42:39.051Z" },
    { monthNumber: 3, paid: false, amount: 0, _id: "p3" },
    { monthNumber: 4, paid: false, amount: 0, _id: "p4" },
    { monthNumber: 5, paid: false, amount: 0, _id: "p5" },
    { monthNumber: 6, paid: false, amount: 0, _id: "p6" },
    { monthNumber: 7, paid: false, amount: 0, _id: "p7" },
    { monthNumber: 8, paid: false, amount: 0, _id: "p8" },
    { monthNumber: 9, paid: false, amount: 0, _id: "p9" },
    { monthNumber: 10, paid: false, amount: 0, _id: "p10" },
];

const mockSummary = {
    totalMonths: 10,
    paidMonths: 2,
    remainingMonths: 8,
    totalPaidAmount: 1000,
    remainingAmount: 4000,
    eligibleForDraw: false
};

const initialBooks: BookData[] = [
    {
        bookId: "69a2edc980ddc563215f435b",
        bookNumber: "001",
        name: "Thomas",
        phone: "9876543210",
        monthlyAmount: 500,
        contributionStatus: "completed",
        luckyDrawStatus: "Won",
        wonDate: "2026-02-27T18:30:00.000Z",
        agent: null,
        summary: mockSummary,
        payments: [...mockPayments]
    },
    {
        bookId: "69a2edc980ddc563215f435c",
        bookNumber: "002",
        name: "Alice Smith",
        phone: "9876543211",
        monthlyAmount: 500,
        contributionStatus: "Active",
        luckyDrawStatus: "NotDraw",
        agent: "Agent Smith",
        summary: { ...mockSummary, paidMonths: 5, remainingMonths: 5, totalPaidAmount: 2500, remainingAmount: 2500, eligibleForDraw: true },
        payments: mockPayments.map(p => p.monthNumber <= 5 ? { ...p, paid: true, amount: 500 } : p)
    }
];

const Book: React.FC = () => {
    const [books, setBooks] = useState<BookData[]>([]);
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
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBooks(currentPage, { searchName, searchPhone, searchBookNo });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchName, searchPhone, searchBookNo]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, searchPhone, searchBookNo]);

    const fetchBooks = async (page: number = 1, searchParams: { searchName?: string; searchPhone?: string; searchBookNo?: string } = {}) => {
        try {
            setLoading(true);
            const response: any = await BookService.getBooks(page, 10, searchParams);
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
            });
        } else {
            setEditingBook(null);
            setFormData({ bookNumber: '', name: '', phone: '', whatsappNumber: '', address: '', monthlyAmount: 500, contributionStatus: 'Active', luckyDrawStatus: 'NotDraw' });
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
        const agentValue = editingBook ? editingBook.agent : null;

        if (editingBook) {
            const updatedBooks = books.map(b => b.bookId === editingBook.bookId ? { ...b, ...formData, agent: agentValue } : b);
            setBooks(updatedBooks);
            if (selectedBook && selectedBook.bookId === editingBook.bookId) {
                const updated = updatedBooks.find(b => b.bookId === editingBook.bookId);
                if (updated) setSelectedBook(updated);
            }
            handleCloseModal();
        } else {
            try {
                // Remove id from new book payload, rely on backend
                const response: any = await BookService.createBook({
                    bookNumber: formData.bookNumber,
                    name: formData.name,
                    phone: formData.phone,
                    whatsappNumber: formData.whatsappNumber,
                    address: formData.address,
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
                                <label>WhatsApp Number</label>
                                <input type="tel" value={formData.whatsappNumber} onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Address</label>
                                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
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
