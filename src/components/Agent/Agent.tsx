import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AgentService from '../../services/AgentService';
import Spinner from '../Spinner/Spinner';
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

    const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setDeleteAgentId(id);
    };

    const executeDelete = async () => {
        if (!deleteAgentId) return;
        try {
            setLoading(true);
            await AgentService.deleteAgent(deleteAgentId);
            fetchAgents();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete agent');
        } finally {
            setLoading(false);
            setDeleteAgentId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!/^\d{10}$/.test(formData.mobileNumber)) {
                alert('Please enter a valid 10-digit mobile number');
                return;
            }
            setLoading(true);
            if (editingAgent) {
                await AgentService.updateAgent(editingAgent._id, formData);
            } else {
                await AgentService.createAgent(formData);
            }
            handleCloseModal();
            await fetchAgents();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="agent-management fade-in-up">
            {loading && <Spinner />}
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
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setFormData({ ...formData, mobileNumber: val });
                                    }}
                                    required
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                />
                                {formData.mobileNumber && formData.mobileNumber.length < 10 && (
                                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                                        {10 - formData.mobileNumber.length} digits remaining
                                    </span>
                                )}
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

            {deleteAgentId !== null && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content glass-card confirm-modal" style={{ maxWidth: '420px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                            <h3 style={{ margin: '0 0 10px' }}>Delete Agent</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                                Are you sure you want to delete <strong>{agents.find(a => a._id === deleteAgentId)?.name}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setDeleteAgentId(null)}>Cancel</button>
                            <button type="button" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }} onClick={executeDelete}>Delete</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Agent;
