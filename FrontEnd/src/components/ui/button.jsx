import React from 'react'

const Button = ({ children, className = '', ...props }) => {
    return (
        <button
            className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
