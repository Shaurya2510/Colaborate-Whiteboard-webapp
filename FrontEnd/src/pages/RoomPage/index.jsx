import { useState, useRef, useEffect } from 'react'
import Whiteboard from '../../components/Whiteboard'
import Chat from '../../components/ChatBar'
import '../../styles/index.css'
import { useToast } from '../../components/ui/use-toast'
import { downloadCanvasAsImage } from '../../utils/exportImage'
import PresenterModal from '../../components/PresenterModal'

// Inline SVG Icons for the toolbar
const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><path d="M11 11h-2v2"></path><path d="M15 11h-2v2"></path><path d="M12 11V8"></path></svg>
);
const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-4l-4 4"></path><path d="M21 12a9 9 0 0 1-9 9c-2.45 0-4.73-.81-6.61-2.18"></path><path d="M3 12a9 9 0 0 1 9-9c2.45 0 4.73.81 6.61 2.18"></path></svg>
);
const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

// ShadCN UI Components
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import ToggleGroup from '../../components/ui/toggle-group'
import { useLocation, useNavigate } from 'react-router-dom'

const RoomPage = ({ user, socket, users }) => {
    // initial user list from props (if any)
    const [userList, setUserList] = useState(users || [])
    // currentUser tracked in state so UI re-renders on permission changes
    const [currentUser, setCurrentUser] = useState(user || null)

    // keep a ref to currentUser to avoid stale closures inside socket callbacks
    const currentUserRef = useRef(currentUser)
    useEffect(() => { currentUserRef.current = currentUser }, [currentUser])

    const [tool, setTool] = useState('pencil')
    const [color, setColor] = useState('#000000')
    const [elements, setElements] = useState([])
    const [history, setHistory] = useState([])
    const [openedUserBar, setOpenedUserBar] = useState(false)
    const [openedChatBar, setOpenedChatBar] = useState(false)
    const [isPresenterModalOpen, setIsPresenterModalOpen] = useState(false)

    const { toast } = useToast()

    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()

    // Redirect if parent didn't supply user
    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user, navigate])

    // Register socket listeners
    useEffect(() => {
        if (!socket) return

        const onPermissionDenied = () => {
            toast({
                title: 'Permission Denied',
                description: "You don't have drawing permissions.",
                variant: 'destructive'
            })
        }

        const onUsersUpdated = (updatedUserList) => {
            setUserList(updatedUserList)

            // keep currentUser in sync
            setCurrentUser(prev => {
                const myId = prev?.userId || user?.userId
                if (!myId) return prev
                const me = updatedUserList.find(u => u.userId === myId)
                return me || prev
            })
        }

        // whiteboard update from server (full elements array)
        const onWhiteboardUpdate = (updatedElements) => {
            setElements(updatedElements || [])
            // optionally reset history? we keep local history as-is
        }

        // whiteboard clear
        const onWhiteboardClear = () => {
            setElements([])
            setHistory([])
            // Also clear canvas client-side if Whiteboard component relies on it
            const canvas = canvasRef.current
            if (canvas) {
                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }

        socket.on('permission-denied', onPermissionDenied)
        socket.on('users-updated', onUsersUpdated)
        socket.on('allUsers', onUsersUpdated)
        socket.on('draw-permission-updated', (canDraw) => {
            setCurrentUser(prev => prev ? { ...prev, presenter: canDraw } : prev)
            setUserList(prevList => {
                const myId = currentUserRef.current?.userId || user?.userId
                if (!myId) return prevList
                return prevList.map(u => (u.userId === myId ? { ...u, presenter: canDraw } : u))
            })
        })

        socket.on('whiteboard-update', onWhiteboardUpdate)
        socket.on('whiteboard-clear', onWhiteboardClear)

        // incremental drawing events (optional) - other users' strokes
        socket.on('receive-element', (data) => {
            // If you want to apply incremental strokes: append to elements
            // Some projects keep drawing incremental and also send full state intermittently.
            // We'll append here if data is a single element
            if (!data) return
            setElements(prev => {
                // avoid duplicates if server also sends full update; this is optional
                return [...prev, data]
            })
        })

        return () => {
            socket.off('permission-denied', onPermissionDenied)
            socket.off('users-updated', onUsersUpdated)
            socket.off('allUsers', onUsersUpdated)
            socket.off('draw-permission-updated')
            socket.off('whiteboard-update', onWhiteboardUpdate)
            socket.off('whiteboard-clear', onWhiteboardClear)
            socket.off('receive-element')
        }
    }, [socket, toast, user])

    // Emit helper: send full elements to server (keeps server's room state)
    const emitFullUpdate = (updatedElements) => {
        if (!currentUser) return
        socket.emit('whiteboard-update', { roomId: currentUser.id, elements: updatedElements })
    }

    // Clear handler
    const handleClear = () => {
        if (!currentUser?.presenter) {
            socket.emit('permission-denied')
            return
        }
        const newElements = []
        setElements(newElements)
        setHistory([])
        socket.emit('whiteboard-clear', { roomId: currentUser.id })
    }

    // Undo handler
    const handleUndo = () => {
        if (!currentUser?.presenter) {
            socket.emit('permission-denied')
            return
        }
        if (elements.length === 0) return
        const last = elements[elements.length - 1]
        const updated = elements.slice(0, -1)
        setHistory(prev => [...prev, last])
        setElements(updated)
        // notify server
        socket.emit('whiteboard-undo', { roomId: currentUser.id, elements: updated })
    }

    // Redo handler
    const handleRedo = () => {
        if (!currentUser?.presenter) {
            socket.emit('permission-denied')
            return
        }
        if (history.length === 0) return
        const last = history[history.length - 1]
        const updated = [...elements, last]
        setHistory(prev => prev.slice(0, -1))
        setElements(updated)
        socket.emit('whiteboard-redo', { roomId: currentUser.id, elements: updated })
    }

    // Render guard
    if (!currentUser && !user) {
        return <div className="p-8 text-center text-gray-400">Loading...</div>
    }

    return (
        <div className="bg-gray-900 text-white w-full h-full min-h-screen flex flex-col items-center">
            <header className="flex justify-between items-center w-full p-4 bg-gray-800 shadow-xl border-b-2 border-blue-500">
                <div className="flex gap-2">
                    <Button onClick={() => setOpenedUserBar(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">Users</Button>
                    <Button onClick={() => setOpenedChatBar(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">Chat</Button>
                </div>

                <h1 className="text-2xl font-extrabold text-blue-400 tracking-wide">
                    Whiteboard Room <span className="text-sm font-normal text-gray-400 ml-2">(Users Online: {userList.length})</span>
                </h1>
            </header>

            {/* User Sidebar */}
            {openedUserBar && (
                <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-50 p-4 border-r-2 border-gray-700">
                    <Button variant="ghost" className="mb-4 text-white hover:bg-gray-800 rounded-full" onClick={() => setOpenedUserBar(false)}>✖</Button>
                    {userList.length === 0 && <div className="text-gray-400">No users found</div>}
                    {userList.map((usr, index) => (
                        <div key={index} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 shadow-sm">
                            <span className="text-gray-200 text-sm">
                                {usr.name} {currentUser?.userId === usr.userId && <span className="text-xs font-normal text-green-400">(You)</span>} {usr.presenter && <span className="text-green-400 ml-1">✏️</span>} {usr.host && <span className="font-bold text-purple-400 ml-2">Host</span>}
                            </span>

                            {/* Only host (currentUser) sees Allow/Revoke for other non-host users */}
                            {currentUser?.host && !usr.host && currentUser?.userId !== usr.userId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded-md transition-colors duration-200"
                                    onClick={() => {
                                        socket.emit("update-draw-permission", {
                                            roomId: currentUser.id,
                                            targetUserId: usr.userId,
                                            canDraw: !usr.presenter
                                        })
                                    }}
                                >
                                    {usr.presenter ? "Revoke" : "Allow"}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Chat Sidebar */}
            {openedChatBar && <Chat setOpenedChatBar={setOpenedChatBar} socket={socket} users={userList} />}

            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 items-center justify-center bg-gray-800 p-4 shadow-xl w-full border-b-2 border-gray-700 rounded-b-xl">
                <ToggleGroup
                    label="Tools"
                    options={[
                        { label: 'Pencil', value: 'pencil' },
                        { label: 'Line', value: 'line' },
                        { label: 'Rectangle', value: 'rect' },
                    ]}
                    value={tool}
                    onChange={setTool}
                    disabled={!currentUser?.presenter}
                />

                <div className="flex items-center gap-2">
                    <label htmlFor="color" className="text-gray-200 font-medium">Color:</label>
                    <Input
                        type="color"
                        id="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-10 h-10 p-0 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                        disabled={!currentUser?.presenter}
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleUndo} disabled={elements.length === 0 || !currentUser?.presenter} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors duration-200"><UndoIcon /><span>Undo</span></Button>
                    <Button onClick={handleRedo} disabled={history.length === 0 || !currentUser?.presenter} className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors duration-200"><RedoIcon /><span>Redo</span></Button>
                    <Button variant="destructive" onClick={handleClear} disabled={!currentUser?.presenter} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors duration-200"><ClearIcon /><span>Clear</span></Button>
                </div>

                <Button
                    variant="outline"
                    onClick={() => downloadCanvasAsImage(canvasRef, 'png')}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                >
                    <DownloadIcon /><span>Download</span>
                </Button>
            </div>

            {/* Whiteboard */}
            <Whiteboard
                canvasRef={canvasRef}
                ctxRef={ctxRef}
                elements={elements}
                setElements={(newElements) => {
                    // Whenever Whiteboard updates elements (new stroke, etc.), update local and broadcast
                    setElements(newElements)
                    // inform server of full state
                    if (currentUser) {
                        socket.emit('whiteboard-update', { roomId: currentUser.id, elements: newElements })
                    }
                }}
                tool={tool}
                color={color}
                setColor={setColor}
                socket={socket}
                user={currentUser}
            />

            {/* Presenter Permissions Modal (kept for compatibility but no host controls shown elsewhere) */}
            <PresenterModal
                isOpen={isPresenterModalOpen}
                setIsOpen={setIsPresenterModalOpen}
                user={currentUser}
                socket={socket}
                users={userList}
            />
        </div>
    )
}

export default RoomPage
