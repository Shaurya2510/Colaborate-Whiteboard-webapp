import React from 'react';
import { Eraser, Undo2, Redo2, Pencil, Square, Minus, Paintbrush } from 'lucide-react';

const Toolbar = ({ tool, setTool, color, setColor, handleUndo, handleRedo, handleClear }) => {
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-xl p-3 rounded-2xl flex items-center gap-4 z-50">
            {/* Tool Selectors */}
            <button onClick={() => setTool("pencil")} className={tool === "pencil" ? "text-purple-700" : ""}>
                <Pencil size={20} />
            </button>
            <button onClick={() => setTool("line")} className={tool === "line" ? "text-purple-700" : ""}>
                <Minus size={20} />
            </button>
            <button onClick={() => setTool("rect")} className={tool === "rect" ? "text-purple-700" : ""}>
                <Square size={20} />
            </button>

            {/* Color Picker */}
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded-full border-none outline-none cursor-pointer"
            />

            {/* Actions */}
            <button onClick={handleUndo} className="text-gray-700 hover:text-black" title="Undo">
                <Undo2 size={20} />
            </button>
            <button onClick={handleRedo} className="text-gray-700 hover:text-black" title="Redo">
                <Redo2 size={20} />
            </button>
            <button onClick={handleClear} className="text-red-500 hover:text-red-700" title="Clear Canvas">
                <Eraser size={20} />
            </button>
        </div>
    );
};

export default Toolbar;
