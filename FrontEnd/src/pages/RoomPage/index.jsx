import { useState, useRef, useEffect } from 'react'
import Whiteboard from '../../components/Whiteboard'
import Chat from '../../components/ChatBar'
import '../../styles/index.css'
import { useToast } from '../../components/ui/use-toast'
import { downloadCanvasAsImage } from '../../utils/exportImage'
import PresenterModal from '../../components/PresenterModal';

// ShadCN UI Components
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import ToggleGroup from '../../components/ui/toggle-group'
import Tooltip from '../../components/ui/tooltip'


const RoomPage = ({ user, socket, users }) => {
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

    useEffect(() => {
        socket.on('permission-denied', () => {
            toast({
                title: 'Permission Denied',
                description: "You don't have drawing permissions.",
                variant: 'destructive'
            })
        })
    }, [socket])

    const handleClear = () => {
        if (!user?.presenter) {
            socket.emit('permission-denied')
            return
        }
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
        setElements([])
    }

    const handleUndo = () => {
        if (!user?.presenter) {
            socket.emit('permission-denied')
            return
        }
        if (elements.length === 0) return
        setHistory(prev => [...prev, elements[elements.length - 1]])
        setElements(prev => prev.slice(0, -1))
    }

    const handleRedo = () => {
        if (!user?.presenter) {
            socket.emit('permission-denied')
            return
        }
        if (history.length === 0) return
        const last = history[history.length - 1]
        setElements(prev => [...prev, last])
        setHistory(prev => prev.slice(0, -1))
    }



    return (
        <div className="bg-gray-900 text-white w-full h-full min-h-screen flex flex-col items-center">
            <header className="flex justify-between items-center w-full p-4 bg-gray-800 shadow">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setOpenedUserBar(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Users</Button>
                    <Button variant="outline" onClick={() => setOpenedChatBar(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Chat</Button>
                    <Button variant="outline" onClick={() => setIsPresenterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Presenter Access</Button>

                    {user?.host && (
                        <Button variant="default" onClick={() => setIsPresenterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">
                            Manage Permissions
                        </Button>
                    )}

                </div>

                <h1 className="text-xl font-semibold">
                    Welcome to the Whiteboard (Users Online: {users.length})
                </h1>
            </header>


            {openedUserBar && (
                <div className="fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg z-10 p-4">
                    <Button variant="ghost" className="mb-4" onClick={() => setOpenedUserBar(false)}>✖</Button>
                    {users.map((usr, index) => (
                        <div key={index} className="flex items-center justify-between mb-2">
                            <span>
                                {usr.name} {user?.userId === usr.userId && "(You)"} {usr.presenter && <span className="text-green-600 ml-1">✏️</span>}
                            </span>
                            {user?.host && user?.userId !== usr.userId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        socket.emit("update-draw-permission", {
                                            roomId: user.id,
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

            {openedChatBar && <Chat setOpenedChatBar={setOpenedChatBar} socket={socket} users={users} />}


            <div className="flex flex-wrap gap-4 items-center justify-center bg-gray-800 p-4 shadow w-full">
                <ToggleGroup
                    label="Tools"
                    options={[
                        { label: 'Pencil', value: 'pencil' },
                        { label: 'Line', value: 'line' },
                        { label: 'Rectangle', value: 'rect' },
                        { label: 'Erase', value: 'erase' },
                    ]}
                    value={tool}
                    onChange={setTool}
                    disabled={!user?.presenter}
                />


                <div className="flex items-center gap-2">
                    <label htmlFor="color">Color:</label>
                    <Input
                        type="color"
                        id="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-10 h-10 p-0 border-none bg-transparent"
                        disabled={!user?.presenter}
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleUndo} disabled={elements.length === 0 || !user?.presenter} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Undo</Button>
                    <Button onClick={handleRedo} disabled={history.length === 0 || !user?.presenter} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Redo</Button>
                    <Button variant="destructive" onClick={handleClear} disabled={!user?.presenter} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">Clear</Button>
                </div>
                <Button
                    variant="outline"
                    onClick={() => downloadCanvasAsImage(canvasRef, 'png')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow"
                >
                    Download current Whiteboard scribes
                </Button>


            </div>

            <Whiteboard
                canvasRef={canvasRef}
                ctxRef={ctxRef}
                elements={elements}
                setElements={setElements}
                tool={tool}
                color={color}
                setColor={setColor}
                socket={socket}
                user={user}
            />
            <PresenterModal
                isOpen={isPresenterModalOpen}
                setIsOpen={setIsPresenterModalOpen}
                user={user}
                socket={socket}
                users={users}
            />



        </div>
    )
}

export default RoomPage
