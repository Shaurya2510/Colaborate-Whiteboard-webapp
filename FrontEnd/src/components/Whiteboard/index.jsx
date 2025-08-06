import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs/bin/rough'
import { createElement } from '../../utils/createElement'
import { drawElement } from '../../utils/drawElement'
import { useToast } from '../ui/use-toast'

const generator = rough.generator()

const Whiteboard = ({
    canvasRef,
    ctxRef,
    elements,
    setElements,
    tool,
    color,
    setColor,
    socket,
    user
}) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const { toast } = useToast()

    // Set canvas context on mount
    useEffect(() => {
        const savedElements = localStorage.getItem('whiteboard-elements');
        if (savedElements) {
            setElements(JSON.parse(savedElements));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('whiteboard-elements', JSON.stringify(elements));
    }, [elements]);


    useEffect(() => {
        const canvas = canvasRef.current
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        const ctx = canvas.getContext('2d')
        ctx.lineCap = 'round'
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctxRef.current = ctx
    }, [])

    // Render elements on canvas
    useLayoutEffect(() => {
        if (!canvasRef.current || !ctxRef.current) return
        const roughCanvas = rough.canvas(canvasRef.current)
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        elements.forEach((element) => {
            drawElement(element, roughCanvas, ctxRef.current)
        })
    }, [elements])

    // Handle receiving drawing data from other users
    useEffect(() => {
        socket.on('receive-element', (data) => {
            setElements((prev) => [...prev, data])
        })

        return () => {
            socket.off('receive-element')
        }
    }, [socket])

    // Drawing handlers
    function handleMouseDown(e) {
        if (!user?.presenter) {
            socket.emit('permission-denied');
            toast({
                title: 'Permission Denied',
                description: "You don't have permission to draw.",
                variant: 'destructive'
            });
            return;
        }

        const { offsetX, offsetY } = e.nativeEvent;

        const newElement = {
            type: tool === 'line' ? 'line' : tool === 'rect' ? 'rect' : tool === 'eraser' ? 'eraser' : 'pencil',
            offsetX,
            offsetY,
            height: offsetY,
            width: offsetX,
            path: tool === 'pencil' || tool === 'eraser' ? [[offsetX, offsetY]] : undefined,
            color: tool === 'eraser' ? '#ffffff' : color
        };


        setElements(prev => [...prev, newElement]);
        socket.emit('draw-element', newElement);
        setIsDrawing(true);
    }

    function handleMouseMove(e) {
        if (!isDrawing || !user?.presenter) return;

        const { offsetX, offsetY } = e.nativeEvent;
        const updatedElements = [...elements];
        const index = updatedElements.length - 1;

        if (tool === 'pencil' || tool === 'eraser') {
            updatedElements[index].path.push([offsetX, offsetY]);
        } else {
            updatedElements[index].width = offsetX;
            updatedElements[index].height = offsetY;
        }

        setElements(updatedElements);
        socket.emit('draw-element', updatedElements[index]);
    }


    function handleMouseUp() {
        if (!user?.presenter) return
        setIsDrawing(false)
    }

    return (
        <div
            style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="shadow-lg"
        >
            <canvas className="bg-white" ref={canvasRef}></canvas>
        </div>
    )
}

export default Whiteboard
