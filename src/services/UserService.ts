import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserService = {
    // Get all users
    getUsers: async () => {
        const response = await axios.get(`${API_URL}/user`);
        return response.data;
    },

    // Get a single user by ID
    getUserById: async (id: number) => {
        const response = await axios.get(`${API_URL}/users/${id}`);
        return response.data;
    },

    // Create a new user
    createUser: async (data: any) => {
        const response = await axios.post(`${API_URL}/user/register`, data);
        return response.data;
    },

    // Update an existing user
    updateUser: async (id: number, data: any): Promise<any> => {
        const response = await axios.put(`${API_URL}/user/${id}`, data);
        return response.data;
    },

    // Delete a user
    deleteUser: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/user/${id}`);
    },

    login: async (userName: string, password: string) => {
        const response = await axios.post(`${API_URL}/user/login`, { userName, password });
        return response.data;
    },

    isAdmin: (): boolean => {
        return localStorage.getItem('role') === 'Admin';
    },
};

export default UserService;
