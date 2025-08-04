import React, { useState } from 'react'

const Tooltip = ({ content, children }) => {
    const [show, setShow] = useState(false)

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-10 bottom-full mb-2 px-2 py-1 text-sm bg-black text-white rounded shadow">
                    {content}
                </div>
            )}
        </div>
    )
}

export default Tooltip
