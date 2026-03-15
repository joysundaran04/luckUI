import React from 'react';
import { createPortal } from 'react-dom';
import './Spinner.css';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
    const spinnerContent = (
        <div className="spinner-overlay">
            <div className="spinner-container">
                <span className="loader"></span>
                {text && <p className="spinner-text">{text}</p>}
            </div>
        </div>
    );

    // Render into document.body to ensure it covers the entire screen, ignoring parent CSS transforms
    return createPortal(spinnerContent, document.body);
};

export default Spinner;
