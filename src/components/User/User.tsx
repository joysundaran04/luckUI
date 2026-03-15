import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserService from '../../services/UserService';
import './User.css';

interface UserData {
    _id: number;
    name: string;
    userName: string;
    password?: string;
    role: string;
}

const User: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await UserService.getUsers();
            setUsers(response.data || []);
            setError('');
        } catch (err: any) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        userName: '',
        password: '',
        role: 'User',
    });

    const handleOpenModal = (user?: UserData) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                userName: user.userName,
                password: user.password || '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', userName: '', password: '', role: 'User' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await UserService.deleteUser(id);
                fetchUsers();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await UserService.updateUser(editingUser._id, formData);
            } else {
                await UserService.createUser(formData);
            }
            handleCloseModal();
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="user-management fade-in-up">
            <div className="user-header-actions">
                <div>
                    <h2>User Management</h2>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    + Add New User
                </button>
            </div>

            <div className="glass-card table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>User Name</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="empty-state">No users found.</td>
                            </tr>
                        ) : (
                            users?.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="avatar-small">{user.userName.charAt(0)}</div>
                                            <span className="user-name-text">{user.userName}</span>
                                        </div>
                                    </td>
                                    <td>{user.userName}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" onClick={() => handleOpenModal(user)} title="Edit">
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(user._id)} title="Delete">
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

            {isModalOpen && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="input-group">
                                <label>User Name</label>
                                <input
                                    type="text"
                                    value={formData.userName}
                                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                    required
                                    placeholder="Enter user name"
                                />
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <input
                                    type={editingUser && !formData.password ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    placeholder={editingUser ? "Leave blank to keep unchanged" : "Secure password"}
                                />
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default User;
