export const drawElement = (element, roughCanvas, ctx) => {
    const { type, offsetX, offsetY, width, height, path, color } = element;

    if (type === 'line') {
        roughCanvas.line(offsetX, offsetY, width, height, {
            stroke: color,
            strokeWidth: 3,
            roughness: 0
        });
    } else if (type === 'rect') {
        roughCanvas.rectangle(offsetX, offsetY, width - offsetX, height - offsetY, {
            stroke: color,
            strokeWidth: 3,
            roughness: 0
        });
    } else if (type === 'pencil') {
        roughCanvas.linearPath(path, {
            stroke: color,
            strokeWidth: 3,
            roughness: 0
        });
    } else if (type === 'eraser') {
        ctx.strokeStyle = "#ffffff"; // match background
        ctx.lineWidth = 10;
        ctx.beginPath();
        for (let i = 0; i < path.length - 1; i++) {
            ctx.moveTo(path[i][0], path[i][1]);
            ctx.lineTo(path[i + 1][0], path[i + 1][1]);
        }
        ctx.stroke();
    }
};
