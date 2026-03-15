import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AgentService = {
    // Get all agents
    getAgents: async () => {
        const response = await axios.get(`${API_URL}/agent`);
        return response.data;
    },

    // Get a single agent by ID
    getAgentById: async (id: string) => {
        const response = await axios.get(`${API_URL}/agent/${id}`);
        return response.data;
    },

    // Create a new agent
    createAgent: async (data: { name: string; place: string; mobileNumber: string }) => {
        const response = await axios.post(`${API_URL}/agent`, data);
        return response.data;
    },

    // Update an existing agent
    updateAgent: async (id: string, data: { name: string; place: string; mobileNumber: string }): Promise<any> => {
        const response = await axios.put(`${API_URL}/agent/${id}`, data);
        return response.data;
    },

    // Delete an agent
    deleteAgent: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/agent/${id}`);
    }
};

export default AgentService;
