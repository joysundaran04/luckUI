import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BookService = {
    // Get all books
    getBooks: async (page: number = 1, limit: number = 10, searchParams: { searchName?: string; searchPhone?: string; searchBookNo?: string } = {}) => {
        const response = await axios.get(`${API_URL}/book/books`, {
            params: { page, limit, ...searchParams }
        });
        return response.data;
    },

    // Get a single book by ID
    getBookById: async (bookId: string) => {
        const response = await axios.get(`${API_URL}/book/books/${bookId}`);
        return response.data;
    },

    // Create a new book
    createBook: async (data: any) => {
        const response = await axios.post(`${API_URL}/book`, data);
        return response.data;
    },

    // Update an existing book
    updateBook: async (bookId: string, data: any) => {
        const response = await axios.put(`${API_URL}/books/${bookId}`, data);
        return response.data;
    },

    // Delete a book
    deleteBook: async (bookId: string) => {
        await axios.delete(`${API_URL}/books/${bookId}`);
    },

    // Update a payment for a specific month
    togglePayment: async (bookId: string, monthNumber: number, data: { paid: boolean; amount: number }) => {
        const response = await axios.put(`${API_URL}/book/${bookId}/month/${monthNumber}`, data);
        return response.data;
    },

    // Update prize information
    updatePrize: async (bookId: string, data: any) => {
        const response = await axios.put(`${API_URL}/book/${bookId}`, data);
        return response.data;
    },

    // Search books
    searchBooks: async (params: { name?: string; phone?: string; bookNumber?: string }) => {
        const response = await axios.get(`${API_URL}/books/search`, { params });
        return response.data;
    },

    // Get all winners
    getWinners: async () => {
        const response = await axios.get(`${API_URL}/book/winners`);
        return response.data;
    },
};

export default BookService;
