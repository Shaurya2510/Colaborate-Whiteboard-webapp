import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from "react-router-dom"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import './index.css'

const CreateRoom = ({ setUser, socket }) => {
    const [id, setId] = useState(uuidv4()) // Room ID
    const [name, setName] = useState("")

    const navigate = useNavigate()

    function handleCodeGen() {
        setId(uuidv4())
    }

    function handleCreateRoom(e) {
        e.preventDefault()
        if (!name.trim()) {
            toast.error("Please enter your name")
            return
        }

        const userData = {
            name,
            id,
            userId: uuidv4(),
            host: true,
            presenter: true
        }
        setUser(userData)
        navigate(`/${id}`)
        socket.emit('user-joined', userData)
    }

    function handleCopyText(e) {
        e.preventDefault()
        toast.success("Room Code copied!")
    }

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <form className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl w-full max-w-md p-8 shadow-2xl flex flex-col items-center space-y-6">
                <h1 className="font-bold text-3xl text-white tracking-wide">Create Room</h1>

                {/* Name Input */}
                <input
                    className="w-full p-3 rounded-lg border border-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />

                {/* Room Code Section */}
                <div className="w-full flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 p-3 rounded-lg border border-gray-400 bg-gray-100 text-gray-700"
                            type="text"
                            disabled
                            value={id}
                        />
                        <button
                            type="button"
                            onClick={handleCodeGen}
                            className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                        >
                            Generate
                        </button>
                        <CopyToClipboard text={id}>
                            <button
                                onClick={handleCopyText}
                                className="px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                            >
                                Copy
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition"
                    onClick={handleCreateRoom}
                >
                    Create Room
                </button>


            </form>
        </div>
    )
}

export default CreateRoom
