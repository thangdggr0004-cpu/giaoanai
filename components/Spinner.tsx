
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-5 w-5 border-2',
        lg: 'h-8 w-8 border-4',
    };

    return (
        <div
            className={`animate-spin rounded-full ${sizeClasses[size]} border-solid border-current border-t-transparent`}
        ></div>
    );
};

export default Spinner;
