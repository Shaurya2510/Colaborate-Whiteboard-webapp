import React from 'react';

const ToggleGroup = ({ options = [], value, onChange, disabled = false }) => {
    return (
        <div className="flex gap-2">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    className={`px-3 py-1 rounded-md border text-sm font-medium transition
            ${value === opt.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-200 text-black border-gray-300 hover:bg-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                    }
                    onClick={() => !disabled && onChange(opt.value)}
                    disabled={disabled}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

export default ToggleGroup;
