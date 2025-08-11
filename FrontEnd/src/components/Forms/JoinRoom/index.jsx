import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import { useToast } from '../../ui/use-toast';
import './index.css';

const JoinRoom = ({ setUser, socket }) => {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!socket) return;

        const onRoomNotFound = () => {
            toast({
                title: 'Room Not Found',
                description: 'The room code you entered does not exist.',
                variant: 'destructive'
            });
        };

        const onUserJoined = (userData) => {
            setUser(userData);
            navigate(`/${userData.id}`);
        };

        socket.on('room-not-found', onRoomNotFound);
        socket.on('user-joined', onUserJoined);

        return () => {
            socket.off('room-not-found', onRoomNotFound);
            socket.off('user-joined', onUserJoined);
        };
    }, [socket, navigate, setUser, toast]);

    function handleJoinRoom(e) {
        e.preventDefault();
        if (!name.trim() || !id.trim()) {
            toast({
                title: 'Missing Fields',
                description: 'Please enter your name and room code.',
                variant: 'destructive'
            });
            return;
        }

        const userData = {
            name,
            id,
            userId: uuidv4(),
            host: false,
            presenter: false
        };
        socket.emit('user-joined', userData);
    }

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <form className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-md p-8 shadow-2xl flex flex-col items-center space-y-6">
                <h1 className="font-bold text-3xl text-white tracking-wide">Join Room</h1>

                {/* Name Input */}
                <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />

                {/* Room Code Input */}
                <input
                    id="input"
                    className="w-full p-3 rounded-lg border border-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    type="text"
                    placeholder="Enter Room Code"
                />

                {/* Submit Button */}
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition"
                    onClick={handleJoinRoom}
                >
                    Join Room
                </button>
            </form>
        </div>
    );
}

export default JoinRoom;
