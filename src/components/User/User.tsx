import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import UserService from '../../services/UserService';
import Spinner from '../Spinner/Spinner';
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                name: user.name || user.userName || '',
                userName: user.userName || '',
                password: '',
                role: user.role || 'User'
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

    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteUserId(id);
    };

    const executeDelete = async () => {
        if (deleteUserId === null) return;
        try {
            setLoading(true);
            await UserService.deleteUser(deleteUserId);
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
            setLoading(false);
        } finally {
            setDeleteUserId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingUser) {
                await UserService.updateUser(editingUser._id, formData);
            } else {
                await UserService.createUser(formData);
            }
            handleCloseModal();
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="user-management fade-in-up">
            {loading && <Spinner />}
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

            {deleteUserId !== null && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-card confirm-modal" style={{ maxWidth: '420px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                            <h3 style={{ margin: '0 0 10px' }}>Delete User</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                Are you sure you want to delete <strong>{users.find(u => u._id === deleteUserId)?.userName}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setDeleteUserId(null)}>Cancel</button>
                            <button type="button" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }} onClick={executeDelete}>Delete</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default User;
