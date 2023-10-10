import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MapTool.css';

function MapToolPage({ onBackClick }) {
    const location = useLocation();
    const selectedImage = location.state?.selectedImage;
    const enteredWords = location.state?.enteredWords;

    
    const [actionStack, setActionStack] = useState([]);
    const [undoStack, setUndoStack] = useState([]);


    const navigate = useNavigate();

    const handleSave = () => {
        // Implement save logic here
    }

    const handleDone = () => {
        // Implement done logic here
    }

    const handleUndo = () => {
        if (actionStack.length > 0) {
            const lastAction = actionStack.pop();
            undoStack.push(lastAction);
            setActionStack([...actionStack]);
            setUndoStack([...undoStack]);
        }
    }
    
    const handleRedo = () => {
        if (undoStack.length > 0) {
            const lastUndoneAction = undoStack.pop();
            actionStack.push(lastUndoneAction);
            setActionStack([...actionStack]);
            setUndoStack([...undoStack]);
        }
    }
    

    const canvasRef = useRef(null);
    const imageCanvasRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('');  // '', 'pencil', or 'eraser'
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const canvas = imageCanvasRef.current;
        const context = canvas.getContext('2d');
        const image = new Image();
        image.src = selectedImage;
        image.onload = () => {
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
    }, [selectedImage]);
    

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        setIsDrawing(true);
    }

    const draw = (e) => {
        if (!isDrawing || !tool) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (tool === 'pencil') {
            context.lineWidth = 2;
            context.strokeStyle = 'black';
            context.lineCap = 'round';
            context.globalCompositeOperation = 'source-over';
        } else if (tool === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
            context.lineWidth = 10;
        }
        context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        context.stroke();
    }
    

    const stopDrawing = () => {
        setIsDrawing(false);
        if (tool === 'pencil') {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            setLines([...lines, imageData]);
        }
    }

    const handleEraser = () => {
        setTool('eraser');
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.putImageData(lines[lines.length - 1], 0, 0);
    }


    const handleBackClick = () => {
        const userConfirmed = window.confirm("Do you want to save your progress?");
        if (userConfirmed) {
            // Save logic here
            navigate("/imagedetail");
        } else {
            navigate("/imagedetail");
        }
    };
    

    return (
        <div className="map-tool-container">
            <div className="top-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleBackClick}>Back</button>
                <button onClick={handleDone}>Done</button>
                <button onClick={handleUndo}>⟲</button>
                <button onClick={handleRedo}>⟳</button>
                <button onClick={() => setTool('pencil')}>✏️</button>
                <button onClick={handleEraser}>🧽</button>
            </div>

            <div className="image-container">
    <canvas 
        ref={canvasRef} 
        width={500}  
        height={500} 
        style={{ position: 'absolute', zIndex: 1 }}
        onMouseDown={startDrawing} 
        onMouseMove={draw}
        onMouseUp={stopDrawing}
    />
    <canvas 
        ref={imageCanvasRef} 
        width={500}
        height={500}
        style={{ position: 'relative', zIndex: 0 }}
    />
</div>


            <div className="word-choice">
                <p>Choose words:</p>
                {enteredWords.map((word, index) => (
                    <button key={index}>{word}</button>
                ))}
            </div>
        </div>
    );
}

export default MapToolPage;