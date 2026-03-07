import React from 'react';
import './Spinner.css';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = () => {
    return (
        <div className="spinner-container">
            <span className="loader"></span>
        </div>
    );
};

export default Spinner;
