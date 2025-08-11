import React, { useEffect, useState, useRef } from 'react';

const Chat = ({ setOpenedChatBar, socket, users }) => {
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");
    const [typingUser, setTypingUser] = useState(null);
    const [userColors, setUserColors] = useState({});

    // State for floating window properties
    const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 50 });
    const [dimensions, setDimensions] = useState({ width: 350, height: 400 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartSize = useRef({ width: 0, height: 0 });
    const resizeStartPos = useRef({ x: 0, y: 0 });

    const chatWindowRef = useRef(null);

    // Assign colors to users
    useEffect(() => {
        const colors = {};
        users.forEach(user => {
            if (!colors[user.name]) {
                colors[user.name] = getRandomColor();
            }
        });
        setUserColors(colors);
    }, [users]);

    // Listen for messages
    useEffect(() => {
        const handleMessage = (data) => {
            setChat(prev => [...prev, { message: data.message, name: data.name }]);
        };
        socket.on("messageResponse", handleMessage);
        return () => socket.off("messageResponse", handleMessage);
    }, [socket]);

    // Listen for typing events
    useEffect(() => {
        const handleTyping = (name) => setTypingUser(name);
        const handleStoppedTyping = () => setTypingUser(null);

        socket.on("userTyping", handleTyping);
        socket.on("userStoppedTyping", handleStoppedTyping);

        return () => {
            socket.off("userTyping", handleTyping);
            socket.off("userStoppedTyping", handleStoppedTyping);
        };
    }, [socket]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() === "") return;
        socket.emit('message', { message });
        setChat(prev => [...prev, { message, name: "You" }]);
        setMessage("");
        socket.emit("userStoppedTyping");
    };

    const getRandomColor = () => {
        const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#22D3EE'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // Dragging Handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Resizing Handlers
    const handleResizeStart = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        resizeStartPos.current = { x: e.clientX, y: e.clientY };
        resizeStartSize.current = { width: dimensions.width, height: dimensions.height };
    };

    // Universal Mouse Move Handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStartPos.current.x,
                    y: e.clientY - dragStartPos.current.y,
                });
            } else if (isResizing) {
                setDimensions({
                    width: resizeStartSize.current.width + (e.clientX - resizeStartPos.current.x),
                    height: resizeStartSize.current.height + (e.clientY - resizeStartPos.current.y),
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, position, dimensions]);

    return (
        <div
            ref={chatWindowRef}
            className="fixed bg-gray-900 text-white shadow-xl z-50 flex flex-col rounded-lg overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                width: dimensions.width,
                height: dimensions.height,
                minWidth: '250px',
                minHeight: '200px',
                cursor: isResizing ? 'nwse-resize' : isDragging ? 'grabbing' : 'default',
            }}
        >
            <div
                className="flex justify-between items-center p-4 border-b border-gray-700 cursor-grab"
                onMouseDown={handleDragStart}
            >
                <h2 className="text-xl font-bold text-gray-200">Room Chat</h2>
                <button
                    onClick={() => setOpenedChatBar(false)}
                    className="text-white hover:text-gray-400 transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {chat.map((msg, index) => (
                    <div key={index} className="mb-2">
                        <span style={{ color: userColors[msg.name] || '#9CA3AF' }} className="font-semibold">
                            {msg.name}:
                        </span>{" "}
                        {msg.message}
                    </div>
                ))}
                {typingUser && (
                    <div className="text-sm text-gray-400 italic px-4">
                        {typingUser} is typing...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 flex gap-2 border-t border-gray-700">
                <input
                    type="text"
                    placeholder="Enter message..."
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        socket.emit("userTyping", users.find(u => u.name === "You")?.name || "You");
                        clearTimeout(window.typingTimeout);
                        window.typingTimeout = setTimeout(() => {
                            socket.emit("userStoppedTyping");
                        }, 1000);
                    }}
                    onBlur={() => socket.emit("userStoppedTyping")}
                    onKeyDown={() => socket.emit("userTyping", users.find(u => u.name === "You")?.name || "You")}
                    className="flex-1 bg-gray-800 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-md transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>

            <div
                className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                onMouseDown={handleResizeStart}
            ></div>
        </div>
    );
};

export default Chat;
