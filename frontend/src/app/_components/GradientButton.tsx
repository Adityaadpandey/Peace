import React from 'react';

const GradientButton: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, className }) => {
    return (
        <button
            className={className}
            style={{
                background: 'linear-gradient(to bottom left, gray, black 20%, black 80%, gray)',
                color: 'white',
                padding: '10px 20px',
                cursor: 'pointer'
            }}
        >
            {children}
        </button>
    );
};

export default GradientButton;