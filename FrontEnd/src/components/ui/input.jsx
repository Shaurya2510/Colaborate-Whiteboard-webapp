import React from 'react'

const Input = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${className}`}
            {...props}
        />
    )
}

export default Input
