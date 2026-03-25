import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PrizeService = {
    getAllPrizes: async (page: number = 1, limit: number = 10, searchParams: { search?: string; status?: string; monthName?: string } = {}) => {
        const response = await axios.get(`${API_URL}/prize`, {
            params: { page, limit, ...searchParams }
        });
        return response.data;
    },

    getPrizeById: async (id: string) => {
        const response = await axios.get(`${API_URL}/prize/${id}`);
        return response.data;
    },

    createPrize: async (data: { prizeNumber: number | string; prizeName: string; priceDistributionStatus?: string; monthName?: string; bookId?: string }) => {
        const response = await axios.post(`${API_URL}/prize`, data);
        return response.data;
    },

    updatePrize: async (id: string, data: any) => {
        const response = await axios.put(`${API_URL}/prize/${id}`, data);
        return response.data;
    },

    deletePrize: async (id: string) => {
        const response = await axios.delete(`${API_URL}/prize/${id}`);
        return response.data;
    }
};

export default PrizeService;
