import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createContext, useContext} from 'react';
import './MapTool.css';
import ReactLassoSelect, {getCanvas} from "react-lasso-select";
import axios from "axios";
import Endpoint from "./Endpoints";

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
    const enteredWords = location.state?.enteredWords;  // note: should probably be renamed to selectedWord
    const [points, setPoints] = useState([]);

    const [canvasHeight, setCanvasHeight] = useState(500);    // make a way to scale the coordinates -- make sure uses same height as pen tool height
    const [canvasWidth, setCanvasWidth] = useState(null);    // make a way to scale the coordinates -- make sure uses same height as pen tool height

    // State to toggle between canvases and ReactLassoSelect
    const [showLassoSelect, setShowLassoSelect] = useState(false);


    const [actionStack, setActionStack] = useState([]);
    const [undoStack, setUndoStack] = useState([]);
    const [penStrokes, setPenStrokes] = useState([]);


    const navigate = useNavigate();

    const handleSave = async () => {
        // Implement save logic here
        // console.log(lines)
        // console.log(points)

        let goalArrayJSON;

        // Lasso Tool Selected
        if (showLassoSelect) {
             goalArrayJSON = convertArrayFormat(points); // Getting the JSON string
        }
        // Pen Tool Selected
        else {
            if (penStrokes.length > 1) {
                let newLines = [];
                let orderedPenStrokes = orderPenStrokes(penStrokes);
                for (let stroke of orderedPenStrokes) {
                    for (let point of stroke.path) {
                        newLines.append(point);
                    }
                }
                goalArrayJSON = convertArrayFormat(newLines);
            }
            else {
                goalArrayJSON = convertArrayFormat(lines); // Getting the JSON string
            }

        }

        // const goalArrayJSON = convertArrayFormat(lines); // Getting the JSON string
        console.log(goalArrayJSON);

        // Implement save logic here
        try {
            // Parsing the JSON string back to an array
            let parsedCoordinates = JSON.parse(goalArrayJSON);

            // Sending the parsed array to the backend
            // const response = await axios.post(`http://localhost:8000/api/add_coordinates/`, {
            const response = await Endpoint.post('add_coordinates/', {
                word_id: enteredWords.id,
                coordinates: parsedCoordinates,
            });

            console.log("Coordinates updated successfully:", response.data);

            // // Update displayed coordinates
            // setDisplayCoordinates(goalArrayJSON);

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

    // Canvas Generation
    useEffect(() => {
        const context = imageCanvasRef.current.getContext('2d');
        drawImageToCanvas(context);
    }, [selectedImage, canvasWidth]);


    useEffect(() => {
        redrawCanvas(penStrokes, canvasRef.current.getContext('2d'));
        console.log("Current collection of penStrokes:", penStrokes);
    }, [penStrokes]);

    const drawImageToCanvas = (context) => {
        const image = new Image();
        image.src = selectedImage.file;
        image.onload = () => {
            // context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);

            // Calculate width based on the aspect ratio
            const aspectRatio = image.naturalWidth / image.naturalHeight;
            const calculatedWidth = canvasHeight * aspectRatio;
            setCanvasWidth(calculatedWidth); // Set the calculated width
            context.drawImage(image, 0, 0, calculatedWidth, canvasHeight);
        }

    }

    // to save imageState for undo redo operations
    const saveCanvasState = (canvas) => {
        const context = canvas.getContext('2d');
        // return context.getImageData(0, 0, canvas.width, canvas.height);
        return context.getImageData(0, 0, canvasWidth, canvasHeight);
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

        for (let removedStroke of lastAction.removedStrokes) {
            setPenStrokes(prev => [...prev, removedStroke]);
        }

        for (let addedStroke of lastAction.addedStrokes) {
            setPenStrokes(penStrokes.filter(stroke => stroke !== addedStroke));
        }

        redrawCanvas(penStrokes, canvasRef.current.getContext('2d'));
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

        for (let removedStroke of actionToRedo.removedStrokes) {
            setPenStrokes(penStrokes.filter(stroke => stroke !== removedStroke));
        }

        for (let addedStroke of actionToRedo.addedStrokes) {
            setPenStrokes(prev => [...prev, addedStroke]);
        }

        redrawCanvas(penStrokes, canvasRef.current.getContext('2d'));
    };


    // const [activeAnnotationIndex, setActiveAnnotationIndex] = useState(null);

    // const NEAR_THRESHOLD = 3; // Number of pixels considered 'near' for extending

    // const findNearbyAnnotation = (x, y) => {
    //     for (let i = actionStack.length - 1; i >= 0; i--) {
    //         const lastPoint = actionStack[i].path[actionStack[i].path.length - 1];
    //         const distance = Math.sqrt(Math.pow(lastPoint.x - x, 2) + Math.pow(lastPoint.y - y, 2));

    //         if (distance < NEAR_THRESHOLD) {
    //             return i;
    //         }
    //     }

    //     return null;
    // };


    //sets tool and sets tool characteristics
    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.beginPath(); // Start a new path

        // Determine if starting near an existing annotation
        const x = e.clientX - canvasRef.current.offsetLeft;
        const y = e.clientY - canvasRef.current.offsetTop;
        
        context.moveTo(x, y); // Move the context path to the starting point without creating a line
        setLines([{ x, y }]);

    };

    const orderPenStrokes = (penStrokes) => {
        penStrokesWithoutDuplicates = [...new Set(penStrokes)];
        let orderedPenStrokes = [];
        let minimumDistance = 10000;

        let closestStroke = penStrokesWithoutDuplicates[0];
        let currentStroke = penStrokesWithoutDuplicates[0];

        orderedPenStrokes.push(currentStroke);
        while (orderedPenStrokes.length < penStrokesWithoutDuplicates.length) {
            for (let j = 0; j <= penStrokes.length; j++) {

                if (penStrokes[j] in orderedPenStrokes) {
                    continue;
                }

                let endToEnd = Math.abs(currentStroke.endPoint.x - penStrokesWithoutDuplicates[j].endPoint.x) +
                    Math.abs(currentStroke.endPoint.y - penStrokesWithoutDuplicates[j].endPoint.y);
                let endToStart = Math.abs(currentStroke.endPoint.x - penStrokesWithoutDuplicates[j].endPoint.x) +
                    Math.abs(currentStroke.startPoint.y - penStrokesWithoutDuplicates[j].startPoint.y);

                let closestPoint = endToEnd < endToStart ? endToEnd : endToStart;

                if (closestPoint < minimumDistance) {
                    minimumDistance = closestPoint;
                    closestStroke = penStrokesWithoutDuplicates[j];

                    if (closestPoint = endToEnd) {
                        closestStroke.endPoint = penStrokesWithoutDuplicates[j].startPoint;
                        closestStroke.startPoint = penStrokesWithoutDuplicates[j].endPoint;
                        closestStroke.path = penStrokesWithoutDuplicates[j].path.reverse();
                    }
                }
            }
            orderedPenStrokes.push(closestStroke);
            currentStroke = closestStroke;
        }
        return orderedPenStrokes;
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

        console.log("Stopped drawing");
        
        
        setIsDrawing(false);

        const uniqueLines = [...new Set(lines)];

        let newStrokes = [];
        let removedStrokes = [];

        console.log("lines: ", uniqueLines);

        if (tool === 'pencil') {
            const newStroke = {
                path: uniqueLines,
                startPoint: lines[0],
                endPoint: lines[lines.length - 1],
                color: penColor,
                width: 2,
            };
            newStrokes.push(newStroke);
        }


        else if (tool === 'eraser' && penStrokes.length > 0) {

            for (let stroke of penStrokes) {
                const penStroke = stroke;
                let oldStrokePath = [...new Set(stroke.path)];
                let newStrokePath = [...new Set(stroke.path)];

                for (let linePoint of uniqueLines) {
                    for (let strokePoint of newStrokePath) {
                        if (Math.abs(linePoint.x - strokePoint.x) < 10 && Math.abs(linePoint.y - strokePoint.y) < 10) {
                            newStrokePath = newStrokePath.filter(point => point !== strokePoint);
                            console.log("newStrokePath: ", newStrokePath);
                        }
                    }
                }

                newStrokePath = [...new Set(newStrokePath)];

                if (newStrokePath.length < oldStrokePath.length) {
                    removedStrokes.push(penStroke);

                    let prevEndPoint = 1;
                    for (let i = 1; i < newStrokePath.length; i++) {
                        let currentPoint = newStrokePath[i];
                        let previousPoint = newStrokePath[i-1];
                        if (Math.abs(currentPoint.x - previousPoint.x) > 2 && Math.abs(currentPoint.y - previousPoint.y) > 2) {
                            const newStroke = penStroke;
                            let newPath = newStroke.path.splice(0, prevEndPoint);
                            newPath = newPath.splice(i);
                            newStroke.endPoint = newPath[0];
                            newStroke.startPoint = newPath[newPath.length-1];
                            newStrokes.push(newStroke);
                            prevEndPoint = i;
                        }
                    }
                }
            }

        }


        setActionStack(prevActionStack => [
            ...prevActionStack, 
            { type: tool, addedStrokes: newStrokes, removedStrokes },
        ]);


        if (removedStrokes.length > 0) {
                for (let removedStroke of removedStrokes) {
                    setPenStrokes(penStrokes.filter(stroke => stroke !== removedStroke));
                }
            }

        
        for (let newStroke of newStrokes) {
            setPenStrokes(prev => [...prev, newStroke]);
        }

        console.log(penStrokes);
        
        const currentState = saveCanvasState(canvasRef.current);

        setUndoStack(prev => [...prev, currentState]);
        setRedoStack([]);

    };


    const redrawCanvas = (penStrokes, canvasContext) => {

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

        penStrokes.forEach(penStroke => {
            canvasContext.beginPath();
            canvasContext.strokeStyle = penStroke.color;
            canvasContext.lineWidth = penStroke.width;
            canvasContext.globalCompositeOperation = penStroke.type === 'eraser' ? 'destination-out' : 'source-over';

            const [firstPoint, ...restOfPoints] = penStroke.path;
            canvasContext.moveTo(firstPoint.x, firstPoint.y);

            console.log(firstPoint);

            restOfPoints.forEach(point => {
                canvasContext.lineTo(point.x, point.y);
                canvasContext.stroke();
            });

            canvasContext.closePath();
        });
    };


    const handleClearAll = () => {
        const newAction = {
            type : 'eraser',
            addedStrokes : [],
            removedStrokes : penStrokes,
        }

        setActionStack(prev => [...prev, newAction]);
        setPenStrokes([]);
    };


    const handleEraser = () => {
        setTool('eraser');
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


    const loadImageAndDraw = () => {
        const context = imageCanvasRef.current.getContext('2d');
        const image = new Image();
        image.src = selectedImage.file;
        image.onload = () => {
            const aspectRatio = image.naturalWidth / image.naturalHeight;
            const calculatedWidth = canvasHeight * aspectRatio;
            setCanvasWidth(calculatedWidth);
            context.drawImage(image, 0, 0, calculatedWidth, canvasHeight);
        };
    };

    // Reloading the Canvases on Toggle
    useEffect(() => {
        if (!showLassoSelect && canvasWidth && canvasHeight) {
            loadImageAndDraw();
        }
    }, [showLassoSelect, canvasWidth, canvasHeight]);

    // Lasso Tool
    const src = selectedImage.file;
    const [previewImage, setPreviewImage] = useState();
    const [previewHeight, setPreviewHeight] = useState(200);

    function convertArrayFormat(sourceArray) {
        const goalArray = sourceArray.map(item => [item.x, item.y]);
        return JSON.stringify(goalArray)
    }

    const toggleDisplay = () => {
        setShowLassoSelect(!showLassoSelect);
    };

    function convertCoordinatesToString(coordinates) {
        return coordinates.map(pair => pair.join(',')).join(' ');
    }

    // Gets and Converts Coordinates from Backend to ReactLassoSelect Format
    useEffect(() => {
        async function fetchCoordinates() {
            if (enteredWords && enteredWords.id) {
                try {
                    // const response = await axios.get(`http://localhost:8000/api/coordinates/${enteredWords.id}/`);
                    const response = await Endpoint.get(`coordinates/${enteredWords.id}/`);
                    const coordinates = response.data.coordinates;

                    if (coordinates) {
                        const coordPoints = coordinates
                            .map(([x, y]) => ({ x, y }));
                        setPoints(coordPoints);
                        // console.log(coordPoints);
                    }
                } catch (error) {
                    console.error("Error fetching coordinates:", error);
                }
            }
        }

        fetchCoordinates();
    }, [enteredWords]);


    return (
        <div className="map-tool-container">
            <div className="top-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleBackClick}>Back</button>
                {/* <button onClick={handleDone}>Done</button> */}
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
                <button onClick={toggleDisplay}>
                    {showLassoSelect ? "Disable Lasso Select" : "Enable Lasso Select"}
                </button>

            </div>

            <div className="image-container">
                { !showLassoSelect && (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={canvasWidth}     // i want dynamically set Width here, to kee
                            height={canvasHeight}
                            style={{position: 'absolute', zIndex: 1}}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                        />
                        <canvas
                        ref={imageCanvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        style={{position: 'relative', zIndex: 0}}
                        />
                    </>
                )}

                { showLassoSelect && (
                    <>
                        <ReactLassoSelect   // React Lasso Select here is Slow
                            value={points}
                            src={src}
                            onChange={value => {
                                setPoints(value);
                            }}
                            // imageStyle={{ height: `${height}px` }}
                            imageStyle={{ height: `${canvasHeight}px` }}
                            onComplete={value => {
                                if (!value.length) return;

                                getCanvas(src, value, (err, canvas) => {
                                    // Preview of Selected Image
                                    if (!err) {
                                        setPreviewImage(canvas.toDataURL());
                                    }
                                });
                            }}
                        />
                    </>
                )}
            </div>

            <h3>Selected Word: {enteredWords.word}</h3>

            { showLassoSelect && (
                <>
                    <h3>Preview</h3>
                    <img src={previewImage} alt="Lasso Preview" height={previewHeight}/>
                </>
            )}

            <h3>Selected Word: {enteredWords.word}</h3>

            { showLassoSelect && (
                <>
                    <h3>Preview</h3>
                    <img src={previewImage} alt="Lasso Preview" height={previewHeight}/>
                </>
            )}

            <div className="word-choice">
                <p>Selected word: {enteredWords.word}</p>
            </div>
        </div>
    );
}

export default MapToolPage;



    // const drawSingleAction = (action, canvasContext) => {
    //     canvasContext.beginPath();
    //     canvasContext.strokeStyle = action.color;
    //     canvasContext.lineWidth = action.width;
    //     canvasContext.globalCompositeOperation = action.type === 'eraser' ? 'destination-out' : 'source-over';

    //     const [firstPoint, ...restOfPoints] = action.path;
    //     canvasContext.moveTo(firstPoint.x, firstPoint.y);

    //     restOfPoints.forEach(point => {
    //         canvasContext.lineTo(point.x, point.y);
    //         canvasContext.stroke();
    //     });

    //     canvasContext.closePath();
    // };


    //const isLineClosed = (lines) => {
    //if (lines.length < 3) return false; // We assume at least 3 points to form a closed shape

    //const startPoint = lines[0];
    //const endPoint = lines[lines.length - 1];
    //const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));

    //return distance < 5; // Threshold to determine if the start and end points are close enough to form a closed shape
    //};


    // const [erasedAnnotations, setErasedAnnotations] = useState([]);

// const nearbyAnnotationIndex = findNearbyAnnotation(x, y);

        // If near an annotation, set it as the active annotation
        // if (nearbyAnnotationIndex !== null) {
        //     setActiveAnnotationIndex(nearbyAnnotationIndex);
        //     setLines(actionStack[nearbyAnnotationIndex].path);
        // } else {
        //     setActiveAnnotationIndex(null);
        //     setLines([{ x, y }]);
        // }

// const loadCanvasState = (canvas, imageData) => {
    //     const context = canvas.getContext('2d');
    //     context.putImageData(imageData, 0, 0);
    // }
  
