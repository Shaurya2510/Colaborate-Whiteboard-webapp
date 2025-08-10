import { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs/bin/rough';
import { drawElement } from '../../utils/drawElement';
import { useToast } from '../ui/use-toast';

const generator = rough.generator();

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
    const [isDrawing, setIsDrawing] = useState(false);
    const { toast } = useToast();

    // Set canvas context on mount
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctxRef.current = ctx;

        const roughCanvas = rough.canvas(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        elements.forEach((element) => {
            drawElement(element, roughCanvas, ctx);
        });
    }, [elements, color, canvasRef, ctxRef]);

    // Handle receiving drawing data from other users
    // This effect is handled in the parent RoomPage component now.
    // The RoomPage component receives the full whiteboard state
    // and passes it down via the `elements` prop,
    // which then triggers the useLayoutEffect above to re-render.

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

        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        const newElement = {
            type: tool,
            offsetX,
            offsetY,
            height: offsetY,
            width: offsetX,
            path: (tool === 'pencil' || tool === 'eraser') ? [[offsetX, offsetY]] : undefined,
            color: tool === 'eraser' ? '#ffffff' : color
        };

        setElements(prev => [...prev, newElement]);
        socket.emit('draw-element', newElement);
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
        if (!user?.presenter) return;
        setIsDrawing(false);
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
    );
};

export default Whiteboard;