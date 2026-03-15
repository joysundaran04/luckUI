import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AgentService from '../../services/AgentService';
import './Agent.css';

interface AgentData {
    _id: string;
    name: string;
    place: string;
    mobileNumber: string;
    createdAt?: string;
    updatedAt?: string;
}

const Agent: React.FC = () => {
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await AgentService.getAgents();
            setAgents(response.data || []);
            setError('');
        } catch (err: any) {
            setError('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        place: '',
        mobileNumber: '',
    });

    const handleOpenModal = (agent?: AgentData) => {
        if (agent) {
            setEditingAgent(agent);
            setFormData({
                name: agent.name,
                place: agent.place,
                mobileNumber: agent.mobileNumber || '',
            });
        } else {
            setEditingAgent(null);
            setFormData({ name: '', place: '', mobileNumber: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAgent(null);
        setFormData({ name: '', place: '', mobileNumber: '' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this agent?')) {
            try {
                await AgentService.deleteAgent(id);
                fetchAgents();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete agent');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAgent) {
                await AgentService.updateAgent(editingAgent._id, formData);
            } else {
                await AgentService.createAgent(formData);
            }
            handleCloseModal();
            fetchAgents();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="agent-management fade-in-up">
            <div className="agent-header-actions">
                <div>
                    <h2>Agent Management</h2>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    + Add New Agent
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="glass-card table-container">
                <table className="agent-table">
                    <thead>
                        <tr>
                            <th>Agent Name</th>
                            <th>Place</th>
                            <th>Mobile Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && agents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="empty-state">Loading agents...</td>
                            </tr>
                        ) : agents?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="empty-state">No agents found.</td>
                            </tr>
                        ) : (
                            agents?.map(agent => (
                                <tr key={agent._id}>
                                    <td>
                                        <div className="agent-info-cell">
                                            <div className="avatar-small">
                                                {agent.name ? agent.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="agent-name-text">{agent.name}</span>
                                        </div>
                                    </td>
                                    <td>{agent.place}</td>
                                    <td>{agent.mobileNumber}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon edit" onClick={() => handleOpenModal(agent)} title="Edit">
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(agent._id)} title="Delete">
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
                    <div className="modal-content glass-card fade-in-up">
                        <h3>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h3>
                        <form onSubmit={handleSubmit} className="agent-form">
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Enter agent name"
                                />
                            </div>

                            <div className="input-group">
                                <label>Place</label>
                                <input
                                    type="text"
                                    value={formData.place}
                                    onChange={e => setFormData({ ...formData, place: e.target.value })}
                                    required
                                    placeholder="Enter place/location"
                                />
                            </div>

                            <div className="input-group">
                                <label>Mobile Number</label>
                                <input
                                    type="tel"
                                    value={formData.mobileNumber}
                                    onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                                    required
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingAgent ? 'Save Changes' : 'Create Agent'}
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

export default Agent;
