export const drawElement = (element, roughCanvas) => {
    const { type, offsetX, offsetY, width, height, path, color } = element

    if (type === 'line') {
        roughCanvas.line(offsetX, offsetY, width, height, {
            stroke: color,
            strokeWidth: 3,
            roughness: 0
        })
    } else if (type === 'rect') {
        roughCanvas.rectangle(offsetX, offsetY, width - offsetX, height - offsetY, {
            stroke: color,
            strokeWidth: 3,
            roughness: 0
        })
    } else if (type === 'pencil') {
        roughCanvas.linearPath(path, {
            stroke: color,
            strokeWidth: 3,
            roughness: 0
        })
    } else if (type === 'eraser') {
        context.strokeStyle = "#ffffff"; // assuming white background
        context.lineWidth = 10;
        context.beginPath();
        for (let i = 0; i < path.length - 1; i++) {
            context.moveTo(path[i][0], path[i][1]);
            context.lineTo(path[i + 1][0], path[i + 1][1]);
        }
        context.stroke();
        return;
    }
}
