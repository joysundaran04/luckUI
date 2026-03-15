import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DashboardService = {
    // Get aggregated dashboard stats
    getStats: async () => {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        return response.data;
    }
};

export default DashboardService;
