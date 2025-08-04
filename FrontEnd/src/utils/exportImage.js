export function downloadCanvasAsImage(canvasRef, format = 'png') {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
}
