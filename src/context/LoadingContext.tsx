import React, { createContext, useContext, useState, ReactNode } from 'react';
import Spinner from '../components/Spinner/Spinner';
import './LoadingContext.css';

interface LoadingContextType {
    showLoader: (text?: string) => void;
    hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [spinnerText, setSpinnerText] = useState<string | undefined>();

    const showLoader = (text?: string) => {
        setSpinnerText(text);
        setIsLoading(true);
    };

    const hideLoader = () => {
        setIsLoading(false);
        setSpinnerText(undefined);
    };

    return (
        <LoadingContext.Provider value={{ showLoader, hideLoader }}>
            {children}
            {isLoading && (
                <div className="global-spinner-overlay">
                    <Spinner />
                </div>
            )}
        </LoadingContext.Provider>
    );
};
