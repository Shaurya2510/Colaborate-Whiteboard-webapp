import { useState, useRef, useEffect } from 'react'
import Whiteboard from '../../components/Whiteboard'
import Chat from '../../components/ChatBar'
import '../../styles/index.css'
import { useToast } from '../../components/ui/use-toast'
import { downloadCanvasAsImage } from '../../utils/exportImage'
import PresenterModal from '../../components/PresenterModal'

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

    // Optional: when Whiteboard draws a new stroke, it should call setElements and also emitFullUpdate
    // Example inside Whiteboard you might call:
    // setElements(prev => { const updated = [...prev, newElement]; socket.emit('whiteboard-update', { roomId: currentUser.id, elements: updated }); return updated; })

    // Render guard
    if (!currentUser && !user) {
        return <div className="p-8 text-center">Loading...</div>
    }

    return (
        <div className="bg-gray-900 text-white w-full h-full min-h-screen flex flex-col items-center">
            <header className="flex justify-between items-center w-full p-4 bg-gray-800 shadow">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpenedUserBar(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Users</Button>
                    <Button variant="outline" onClick={() => setOpenedChatBar(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Chat</Button>
                </div>

                <h1 className="text-xl font-semibold">
                    Welcome to the Whiteboard (Users Online: {userList.length})
                </h1>
            </header>

            {/* User Sidebar */}
            {openedUserBar && (
                <div className="fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg z-10 p-4">
                    <Button variant="ghost" className="mb-4" onClick={() => setOpenedUserBar(false)}>✖</Button>
                    {userList.length === 0 && <div>No users found</div>}
                    {userList.map((usr, index) => (
                        <div key={index} className="flex items-center justify-between mb-2">
                            <span>
                                {usr.name} {currentUser?.userId === usr.userId && "(You)"} {usr.presenter && <span className="text-green-600 ml-1">✏️</span>} {usr.host && <span className="font-bold ml-2">Host</span>}
                            </span>

                            {/* Only host (currentUser) sees Allow/Revoke for other non-host users */}
                            {currentUser?.host && !usr.host && currentUser?.userId !== usr.userId && (
                                <Button
                                    variant="outline"
                                    size="sm"
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
            <div className="flex flex-wrap gap-4 items-center justify-center bg-gray-800 p-4 shadow w-full">
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
                    <label htmlFor="color">Color:</label>
                    <Input
                        type="color"
                        id="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-10 h-10 p-0 border-none bg-transparent"
                        disabled={!currentUser?.presenter}
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleUndo} disabled={elements.length === 0 || !currentUser?.presenter} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Undo</Button>
                    <Button onClick={handleRedo} disabled={history.length === 0 || !currentUser?.presenter} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Redo</Button>
                    <Button variant="destructive" onClick={handleClear} disabled={!currentUser?.presenter} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Clear</Button>
                </div>

                <Button
                    variant="outline"
                    onClick={() => downloadCanvasAsImage(canvasRef, 'png')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow"
                >
                    Download current Whiteboard scribes
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
