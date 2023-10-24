import React, {useState, useRef, useEffect, createContext, useContext} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MapTool.css';
import axios from "axios";

import ReactLassoSelect, { getCanvas } from 'react-lasso-select';

//access components of imageDetailPage after navigating from MapToolPage
const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [words, setWords] = useState([]);

    return (
        <ImageContext.Provider value={{ images, setImages, words, setWords }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImageStore = () => useContext(ImageContext);

function MapToolPage({ onBackClick }) {
    const location = useLocation();
    const selectedImage = location.state?.selectedImage;
    const enteredWords = location.state?.enteredWords;

    
    const [actionStack, setActionStack] = useState([]);
    const [undoStack, setUndoStack] = useState([]);

    const [points, setPoints] = useState([]);
    const [displayCoordinates, setDisplayCoordinates] = useState('');

    const navigate = useNavigate();

    const handleLassoTool = () => {

    }

    const handleSave = async () => {
        const goalArrayJSON = convertArrayFormat(points); // Getting the JSON string
        console.log(goalArrayJSON);

        // Implement save logic here
        try {
            // Parsing the JSON string back to an array
            let parsedCoordinates = JSON.parse(goalArrayJSON);

            // Sending the parsed array to the backend
            const response = await axios.post(`http://localhost:8000/api/add_coordinates/`, {
                word_id: enteredWords.id,
                coordinates: parsedCoordinates,
            });

            console.log("Coordinates updated successfully:", response.data);

            // Update displayed coordinates
            setDisplayCoordinates(goalArrayJSON);

            // setPoints([]); // Clearing the points array
        } catch (error) {
            console.error("Error updating coordinates:", error);
        }
    }

    const canvasRef = useRef(null);
    const imageCanvasRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('');  // '', 'pencil', or 'eraser'
    const [penColor, setPenColor] = useState('black');
    const [lines, setLines] = useState([]);
    const [showPaletteDropdown, setShowPaletteDropdown] = useState(false);
    const colors = ['black', 'red', 'white','teal'];
    const dropdownRef = useRef(null);


   useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowPaletteDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const context = imageCanvasRef.current.getContext('2d');
        drawImageToCanvas(context);
    }, [selectedImage]);


    useEffect(() => {
        redrawCanvas(actionStack, canvasRef.current.getContext('2d'));
    }, [actionStack]);


    const drawImageToCanvas = (context) => {
        const image = new Image();
        image.src = selectedImage.file;
        image.onload = () => {
            context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
        }
    }

    const startDrawing = (e) => {
        setIsDrawing(true);
        const context = canvasRef.current.getContext('2d');
    
        if (tool === 'pencil') {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = penColor;
            context.lineWidth = 2;
        } else if (tool === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
            context.lineWidth = 10;
        }
    
        context.beginPath();  // Start a new path for the drawing or erasing
        setLines([{ x: e.clientX - canvasRef.current.offsetLeft, y: e.clientY - canvasRef.current.offsetTop }]);
    };

    const draw = (e) => {
        if (!isDrawing || !tool) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
    
        // Setup context properties based on the current tool
        if (tool === 'pencil') {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = penColor;
            context.lineWidth = 2;
        } else if (tool === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
            context.lineWidth = 10;
        }
    
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;
    
        setLines(prev => [...prev, { x, y }]);  // Store line coordinates
    
        context.lineTo(x, y);
        context.stroke();
    };
    

    const stopDrawing = () => {
        setIsDrawing(false);
    
        // Check if the start and end points are close
        const startPoint = lines[0];
        const endPoint = lines[lines.length - 1];
        const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
    
        if (distance > 10) {  // A threshold, you can adjust this value as needed
            alert("Annotation not complete! Please connect boundary end points.");
            return;  // Do not save the current annotation
        }
    
        setActionStack(prev => [
            ...prev,
            {
                type: tool,
                path: lines,
                color: tool === 'pencil' ? penColor : null,
                width: tool === 'pencil' ? 2 :10
            }
        ]);
        
        setLines([]);
    };


    const redrawCanvas = (actions, canvasContext) => {
        canvasContext.clearRect(0,0,canvasContext.canvas.width, canvasContext.canvas.height);
        
        drawImageToCanvas(canvasContext);
        
        actions.forEach (action=> {
            canvasContext.beginPath();
            canvasContext.strokeStyle = action.color;
            canvasContext.lineWidth = action.width;
            canvasContext.globalCompositeOperation = action.type === 'eraser' ? 'destination-out' : 'source-over';
            
            const [firstPoint, ...restOfPoints] = action.path;
            canvasContext.moveTo(firstPoint.x, firstPoint.y);

            restOfPoints.forEach(point => {
                canvasContext.lineTo(point.x, point.y);
                canvasContext.stroke();
            });

            canvasContext.closePath();

        });

    };

    const handleClearAll = () => {
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawImageToCanvas(context);

        if (actionStack.length > 0)
        {
            setUndoStack([...undoStack, ...actionStack]);
        }
        setActionStack([]);
      
    };

    const handleEraser = () => {
        setTool('eraser');
    }

    const lastActionTimeRef = useRef(null);

    // Helper function to handle debouncing
    const isDebounced = (delay = 300) => {
        const currentTime = Date.now();
        if (lastActionTimeRef.current && currentTime - lastActionTimeRef.current < delay) {
            return true;
        }
        lastActionTimeRef.current = currentTime;
        return false;
    };


    const handleUndo = () => {
        if (isDebounced()) return;  // Avoid rapid successive clicks

        console.log("Before Undo:", actionStack, undoStack);
        
        if (actionStack.length === 0) return;

        const newUndoAction = actionStack[actionStack.length - 1];
        setUndoStack(prev => [...prev, newUndoAction]);

        setActionStack(prev => {
            const newActionStack = prev.slice(0, -1);
            return newActionStack;
        });

        console.log("After Undo:", actionStack, undoStack);
    };

    const handleRedo = () => {
        if (isDebounced()) return;  // Avoid rapid successive clicks

        console.log("Before Redo:", actionStack, undoStack);
        
        if (undoStack.length === 0) return;

        const redoAction = undoStack[undoStack.length - 1];
        setUndoStack(prev => prev.slice(0, -1));

        setActionStack(prev => [...prev, redoAction]);

        console.log("After Redo:", actionStack, undoStack);
    };
    
    
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
                {/*<button onClick={handleDone}>Done</button>*/}
                <button onClick={handleUndo}>⟲</button>
                <button onClick={handleRedo}>⟳</button>

                <button onClick={handleLassoTool}>⏢</button>

                <button onClick={() => setTool('pencil')}>✏️</button>
                {colors.map(color => (
                  <button 
                    key={color} 
                    className={`color-button ${color}`} 
                    style={{ backgroundColor: color }} 
                    onClick={() => setPenColor(color)}
                  >
                  </button>
                ))}
                <button onClick={handleEraser}>🧽</button>
                <button onClick={handleClearAll}>🗑️ Clear All</button>
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
                <p>Selected word: {enteredWords.word}</p>
            </div>



        </div>
    );
}

export default MapToolPage;
