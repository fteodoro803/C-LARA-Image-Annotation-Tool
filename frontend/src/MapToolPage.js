import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createContext, useContext} from 'react';
import './MapTool.css';

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


    const navigate = useNavigate();

    const handleSave = () => {
        // Implement save logic here
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
        image.src = selectedImage;
        image.onload = () => {
            context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
        }

    }
    
    // to save imageState for undo redo operations
    const saveCanvasState = (canvas) => {
        const context = canvas.getContext('2d');
        return context.getImageData(0, 0, canvas.width, canvas.height);
      }
      
      const loadCanvasState = (canvas, imageData) => {
        const context = canvas.getContext('2d');
        context.putImageData(imageData, 0, 0);
      }
      
      
      const handleUndo = () => {
        if (actionStack.length === 0) return;
    
        const lastAction = actionStack[actionStack.length - 1];
        setRedoStack(prev => [...prev, lastAction]);
        
        setActionStack(prev => {
            const newStack = [...prev];
            newStack.pop();
            return newStack;
        });
    
        redrawCanvas(actionStack, canvasRef.current.getContext('2d'));
      };
    
      
      //intialise redo stack
      const [redoStack, setRedoStack] = useState([]);

      const handleRedo = () => {
        if (redoStack.length === 0) return;
    
        const actionToRedo = redoStack[redoStack.length - 1];
        setActionStack(prev => [...prev, actionToRedo]);
        
        setRedoStack(prev => {
            const newStack = [...prev];
            newStack.pop();
            return newStack;
        });
    
        redrawCanvas(actionStack, canvasRef.current.getContext('2d'));
    };

      
      
    
      
    
    //sets tool and sets tool characteristics
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

    const drawSingleAction = (action, canvasContext) => {
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
    };


    const isLineClosed = (lines) => {
        if (lines.length < 3) return false; // We assume at least 3 points to form a closed shape
    
        const startPoint = lines[0];
        const endPoint = lines[lines.length - 1];
        const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
    
        return distance < 5; // Threshold to determine if the start and end points are close enough to form a closed shape
    };

    
    

    const stopDrawing = () => {
        setIsDrawing(false);
        const isCurrentLineClosed = isLineClosed(lines);
    
        if (!isCurrentLineClosed) {
            alert("Annotation not closed. Please close the annotation by connecting the endpoints.");
            return; // Return early to stop further execution if the annotation isn't closed
        }
    
        const newAction = {
            type: tool,
            path: lines,
            color: tool === 'pencil' ? penColor : null,
            width: tool === 'pencil' ? 2 : 10,
            isClosed: isCurrentLineClosed
        };
    
        if (tool === 'eraser') {
            setActionStack(prev => {
                const newState = [...prev];
    
                for (let i = 0; i < newState.length; i++) {
                    const action = newState[i];
    
                    if (action.type === 'pencil' && lines.some(line => 
                        Math.abs(line.x - action.path[0].x) < 10 && 
                        Math.abs(line.y - action.path[0].y) < 10
                    )) {
                        newState.splice(i, 1); // Remove this action as it's erased
                        break;
                    }
                }
    
                return newState;
            });
        } else {
            setActionStack(prev => [...prev, newAction]);
        }
    
        // Now redraw the entire canvas based on actionStack
        const canvasContext = canvasRef.current.getContext('2d');
        redrawCanvas(actionStack, canvasContext); 
    
        const currentState = saveCanvasState(canvasRef.current);
        setUndoStack(prev => [...prev, currentState]);
        setRedoStack([]);
    };
    
    
    
        

    const redrawCanvas = (actions, canvasContext) => {
        // Clear only the annotation canvas, not the image canvas
        canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
        
        actions.forEach(action => {
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
        
      };
      

    const handleEraser = () => {
        setTool('eraser');
    }

    


    const handleDone = () => {
    // Ensure there are completed annotations
    if (actionStack.length > 0) {
        // Get the most recent annotation
        const recentAnnotation = actionStack[actionStack.length - 1];
        
        // Retrieve its coordinates
        const recentCoordinates = recentAnnotation.path;
        
        // log coordinates can be passed to other functions(e.g., log them, save them, etc.)
        console.log(recentCoordinates);
    } else {
        alert("No annotations have been made.");
    }
    
    // Any other logic you want to implement for the "Done" action...
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
                <p>Choose words:</p>
                {enteredWords.map((word, index) => (
                    <button key={index}>{word}</button>
                ))}
            </div>
        </div>
    );
}

export default MapToolPage;
