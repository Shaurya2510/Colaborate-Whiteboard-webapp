import React, { useEffect, useState } from 'react';

const Chat = ({ setOpenedChatBar, socket, users }) => {
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");
    const [typingUser, setTypingUser] = useState(null);
    const [userColors, setUserColors] = useState({});

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

    return (
        <div
            style={{
                height: "100vh",
                width: "400px",
                position: "fixed",
                top: "0",
                left: "0",
                backgroundColor: "white",
                color: "black",
                zIndex: 50
            }}
            className="shadow-lg overflow-hidden flex flex-col"
        >
            <button
                onClick={() => setOpenedChatBar(false)}
                className="p-2 w-[2em] h-[2em] text-center items-center flex text-black absolute"
            >
                ✖
            </button>

            <div className="mt-8 p-4 flex-1 overflow-y-auto">
                {chat.map((msg, index) => (
                    <div key={index} className="mb-2">
                        <span style={{ color: userColors[msg.name] || '#000' }}>
                            <strong>{msg.name}:</strong>
                        </span>{" "}
                        {msg.message}
                    </div>
                ))}
                {typingUser && (
                    <div className="text-sm text-gray-500 italic px-4">{typingUser} is typing...</div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-2 flex">
                <input
                    type="text"
                    placeholder="Enter message"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        socket.emit("userTyping", socket.id);
                        clearTimeout(window.typingTimeout);
                        window.typingTimeout = setTimeout(() => {
                            socket.emit("userStoppedTyping");
                        }, 1000); // stops typing after 1 sec of inactivity
                        socket.emit("userTyping", "Someone"); // Replace "Someone" with user.name if available
                    }}
                    onBlur={() => socket.emit("userStoppedTyping")}
                    onKeyDown={() => socket.emit("userTyping", "Someone")}
                    className="w-[90%] bg-slate-200 p-2 mx-1 rounded-lg"
                />
                <button className="p-1 mx-1 text-green-500">➤</button>
            </form>
        </div>
    );
};

export default Chat;
