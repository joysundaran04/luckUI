import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';
import UserService from '../../services/UserService';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            setIsLoading(true);
            const user = await UserService.login(userName, password);
            localStorage.setItem('role', user.user.role);
            localStorage.setItem('userName', user.user.userName);

            if (user.user.role === 'Manager') {
                navigate('/admin/book');
            } else {
                navigate('/admin');
            }
            setIsLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
            setIsLoading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="login-container">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="login-container fade-in">
            <div className="login-box transparent-glass">
                <div className="login-header">
                    <h2>Lucky Draw</h2>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="userName">User Name</label>
                        <input
                            type="text"
                            id="userName"
                            placeholder="Enter your User Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="login-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                    <p className="developer-credit">Developed by <span>@Jo4 Tech Solutions</span></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
