export const createElement = (tool, offsetX, offsetY, color) => {
    if (tool === 'pencil') {
        return {
            type: 'pencil',
            offsetX,
            offsetY,
            path: [[offsetX, offsetY]],
            color
        }
    } else if (tool === 'line') {
        return {
            type: 'line',
            offsetX,
            offsetY,
            width: offsetX,
            height: offsetY,
            color
        }
    } else if (tool === 'rect') {
        return {
            type: 'rect',
            offsetX,
            offsetY,
            width: 0,
            height: 0,
            color
        }
    }
}
