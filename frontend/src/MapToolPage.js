import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createContext, useContext} from 'react';
import './MapTool.css';
import ReactLassoSelect, {getCanvas} from "react-lasso-select";
import Endpoint from "./Endpoints";


// Access components of imageDetailPage after navigating to MapToolPage
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
    const selectedWord = location.state?.selectedWord;
    const [points, setPoints] = useState([]);

    const [canvasHeight, setCanvasHeight] = useState(500);    // make a way to scale the coordinates -- make sure uses same height as pen tool height
    const [canvasWidth, setCanvasWidth] = useState(null);    // make a way to scale the coordinates -- make sure uses same height as pen tool height
    const [scalingFactor, setScalingFactor] = useState(1);
    const [aspectRatio, setAspectRatio] = useState(1);

    // State to toggle between canvases and ReactLassoSelect
    const [lassoSelectEnabled, setLassoSelectEnabled] = useState(false);
    const [progressSaved, setProgressSaved] = useState(false);


    // Instantiate the actionStack, penStrokes, and currentAction
    const [actionStack, setActionStack] = useState([]);
    const [penStrokes, setPenStrokes] = useState([]);
    const [currentAction, setCurrentAction] = useState(null);

    const navigate = useNavigate();

    const canvasRef = useRef(null);
    const imageCanvasRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('');  // '', 'pencil', or 'eraser'
    const [penColor, setPenColor] = useState('black');
    const [lines, setLines] = useState([]);
    const [showPaletteDropdown, setShowPaletteDropdown] = useState(false);
    const colors = ['black', 'red', 'white','teal'];
    const dropdownRef = useRef(null);

    const [redoStack, setRedoStack] = useState([]);


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


    // Initial Canvas Generation
    useEffect(() => {
        const context = imageCanvasRef.current.getContext('2d');
        drawImageToCanvas(context);
    }, [selectedImage, canvasWidth]);


    // Redraws the canvas whenever penStrokes is altered
    useEffect(() => {
        const context = canvasRef.current.getContext('2d');
        redrawCanvas(penStrokes, context);
        // console.log(penStrokes);
    }, [penStrokes]);


    // Renders the selected image on the canvas
    const drawImageToCanvas = (context) => {
        const image = new Image();
        image.src = selectedImage.file;
        image.onload = () => {

            // Calculate width based on the aspect ratio
            setAspectRatio(image.naturalWidth / image.naturalHeight);
            const calculatedWidth = canvasHeight * aspectRatio;
            setCanvasWidth(calculatedWidth); // Set the calculated width
            setScalingFactor(canvasHeight / image.naturalHeight);
            context.drawImage(image, 0, 0, calculatedWidth, canvasHeight);
        }
    }


    // Reloading the Canvases on Toggle
    useEffect(() => {
        if (!lassoSelectEnabled && canvasWidth && canvasHeight) {
            loadImageAndDraw();
        }
    }, [lassoSelectEnabled, canvasWidth, canvasHeight]);


    // Orders the penStrokes based on distance of endPoints to create a correct connected polygon
    const orderPenStrokes = (penStrokes) => {
        if (penStrokes.length === 1) {
            return penStrokes;
        }

        let orderedPenStrokes = [];
        let minimumDistance = 10000;

        // Sets currentStroke to the first stroke
        let closestStroke = penStrokes[0];
        let currentStroke = penStrokes[0];

        orderedPenStrokes.push(currentStroke);

        // Checks which end/start point of all other strokes is closest to the endpoint of the current stroke
        while (orderedPenStrokes.length < penStrokes.length) {
            let currentEndX = currentStroke.path[currentStroke.path.length - 1].x;
            let currentEndY = currentStroke.path[currentStroke.path.length - 1].y;

            for (let j = 0; j < penStrokes.length; j++) {

                if (penStrokes[j] !== currentStroke) {

                    let nextEndX = penStrokes[j].path[penStrokes[j].path.length - 1].x;
                    let nextEndY = penStrokes[j].path[penStrokes[j].path.length - 1].y;
                    let nextStartX = penStrokes[j].path[0].x;
                    let nextStartY = penStrokes[j].path[0].y;

                    // Checks the distances between the current stroke's endpoint and the next stroke's end and starting points
                    let endToEnd = Math.abs(currentEndX - nextEndX) +
                        Math.abs(currentEndY - nextEndY);
                    let endToStart = Math.abs(currentEndX - nextStartX) +
                        Math.abs(currentEndY - nextStartY);

                    let closestPoint = endToEnd < endToStart ? endToEnd : endToStart;

                    // If this stroke's end or starting points are closer to the current stroke's endpoints than previously checked
                    // strokes, set this stroke as the closest stroke
                    if (closestPoint < minimumDistance) {
                        minimumDistance = closestPoint;
                        closestStroke = penStrokes[j];

                        // Reverses the order of coordinates for the closest stroke if its endpoint is closer to the endpoint
                        // of the current stroke than its starting point
                        if (closestPoint === endToEnd) {
                            closestStroke.path = penStrokes[j].path.reverse();
                        }
                    }
                }
            }

            // Sets the new current stroke to the closest stroke
            orderedPenStrokes.push(closestStroke);
            currentStroke = closestStroke;
        }
        return orderedPenStrokes;
    };


    // Handles saving of mapping coordinates to database
    const handleSave = async () => {

        let goalArrayJSON;

        // Adjust points to original scale before saving

        const adjustPointsToOriginalScale = (penStrokes) => {
            return penStrokes.map(stroke => ({
                ...stroke,
                path: stroke.path.map(point => ({
                    // x: point.x,
                    // y: point.y
                    x: Math.round(point.x /scalingFactor),
                    y: Math.round(point.y / scalingFactor)

                }))
            }));
        };

        // Lasso Tool Selected
        if (lassoSelectEnabled) {
             goalArrayJSON = convertArrayFormat(points); // Getting the JSON string
        }
        // Pen Tool Selected
        else if (penStrokes.length > 0) {
            let adjustedPenStrokes = adjustPointsToOriginalScale(penStrokes);
            let orderedPenStrokes = orderPenStrokes(adjustedPenStrokes);

            let orderedPoints = [];
            for (let stroke of orderedPenStrokes) {
                for (let point of stroke.path) {
                    orderedPoints.push(point);
                }
            }

            goalArrayJSON = convertArrayFormat(orderedPoints);
        }
        else {
            goalArrayJSON = convertArrayFormat([]);
        }
        // console.log(goalArrayJSON);
        setProgressSaved(true);

        try {
            // Parsing the JSON string back to an array
            let parsedCoordinates = JSON.parse(goalArrayJSON);

            // Sending the parsed array to the backend
            const response = await Endpoint.post('add_coordinates/', {
                word_id: selectedWord.id,
                coordinates: parsedCoordinates,
                toolUsed: lassoSelectEnabled ? "lasso" : "pencil",
            });

            // console.log("Coordinates updated successfully:", response.data);
            alert("Progress saved successfully!");

        } catch (error) {
            console.error("Error updating coordinates:", error);
        }
    }


    // If the action stack exceeds a length of 5 when adding a new action, remove the first action in the stack
    const addActionToStack = (newAction) => {
        setActionStack(prevActionStack => {
            const stackWithNewAction = [...prevActionStack, newAction];
            while (stackWithNewAction.length > 5) {
                stackWithNewAction.shift();
            }
            return stackWithNewAction;
        });
    };


    // Removes the previous action from the action stack and the associated pen strokes from the canvas
    const handleUndo = () => {
        if (actionStack.length === 0) return;

        setRedoStack(prev => [...prev, actionStack[actionStack.length - 1]]);
        setActionStack(prevActionStack => prevActionStack.slice(0, -1));

        const previousPenStrokes = actionStack[actionStack.length - 1].previousState;

        setPenStrokes(previousPenStrokes);
    };

    // Restores the most recently removed action in the action stack and adds the associated pen strokes back to the canvas
    const handleRedo = () => {

        if (redoStack.length === 0) return;

        const actionToRedo = redoStack[redoStack.length - 1];
        setRedoStack(prevRedoStack => prevRedoStack.slice(0, -1));

        addActionToStack(actionToRedo);

        setPenStrokes(actionToRedo.newState);
    };


    // Removes all pen strokes from the canvas and adds the 'Clear All' action to the action stack
    const handleClearAll = () => {
        const newAction = {
            type : 'eraser',
            previousState : penStrokes,
            newState : [],
        }

        addActionToStack(newAction);

        setPenStrokes([]);
    };


    // Navigates back to the Image Detail Page
    const handleBackClick = () => {
        if (!progressSaved) {
            const userConfirmed = window.confirm("Proceed without saving your progress?");

            if (userConfirmed) {
                navigate("/imagedetail");
            }
        } else {
            navigate("/imagedetail");
            setProgressSaved(false);
        }
    };


    // Sets tool and sets tool characteristics
    const startDrawing = (e) => {
        setIsDrawing(true);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.beginPath(); // Start a new path

        const x = e.clientX - canvasRef.current.offsetLeft;
        const y = e.clientY - canvasRef.current.offsetTop;

        context.moveTo(x, y); // Move the context path to the starting point without creating a line
        setLines([{ x, y }]);

        // Saves the current state of the canvas to the draw action
        const currentState = [...penStrokes];

        setCurrentAction({
            type: tool,
            previousState: currentState
        });

        setRedoStack([]);
    };


    // Stores coordinates of mouse input during draw action
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


    // Updates penStrokes and actionStack based on the input of the finished draw action
    const stopDrawing = () => {

        setIsDrawing(false);

        if (tool === 'pencil') {

            const newStroke = {
                path: lines,
                color: penColor,
                width: 2,
            };

            const newState = [...penStrokes, newStroke];

            addActionToStack(
                {
                ...currentAction,
                newState: newState
                }
            );

            // Updates penStrokes with the result of the pencil action
            setPenStrokes(newState);

            setCurrentAction(null);
        }

        else if (tool === 'eraser') {
            let nonErasedStrokes = penStrokes;

            // Checks if any coordinates of the erased line overlaps with any existing stroke
            if (penStrokes.length > 0) {
                for (let stroke of penStrokes) {
                    for (let linePoint of lines) {
                        for (let strokePoint of stroke.path) {
                            // Deletes the stroke from nonErasedStrokes if erased line overlaps
                            if (Math.abs(linePoint.x - strokePoint.x) < 10 && Math.abs(linePoint.y - strokePoint.y) < 10) {
                                nonErasedStrokes = nonErasedStrokes.filter(currentStroke => currentStroke !== stroke);
                            }
                        }
                    }
                }
            }

            const newState = nonErasedStrokes;

            addActionToStack(
                {
                ...currentAction,
                newState: newState
                }
            );

            // Updates penStrokes with the result of the erase action
            setPenStrokes(newState);

            setCurrentAction(null);
        }
    };


    // Renders the annotation canvas by redrawing all of the pen strokes
    const redrawCanvas = (penStrokes, canvasContext) => {

        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

        penStrokes.forEach(penStroke => {
            canvasContext.beginPath();
            canvasContext.strokeStyle = penStroke.color;
            canvasContext.lineWidth = penStroke.width;
            canvasContext.globalCompositeOperation = penStroke.type === 'eraser' ? 'destination-out' : 'source-over';

            const [firstPoint, ...restOfPoints] = penStroke.path;
            canvasContext.moveTo(firstPoint.x, firstPoint.y);

            // console.log(firstPoint);

            restOfPoints.forEach(point => {
                canvasContext.lineTo(point.x, point.y);
                canvasContext.stroke();
            });

            canvasContext.closePath();
        });
    };


    // Re-renders Canvas
    const loadImageAndDraw = () => {
        const context = imageCanvasRef.current.getContext('2d');
        const image = new Image();
        image.src = selectedImage.file;
        image.onload = () => {
            const aspectRatio = image.naturalWidth / image.naturalHeight;
            const calculatedWidth = canvasHeight * aspectRatio;
            setCanvasWidth(calculatedWidth);
            context.drawImage(image, 0, 0, calculatedWidth, canvasHeight);

            // Redraw the pencil strokes after the image is loaded and drawn
            const penContext = canvasRef.current.getContext('2d');
            redrawCanvas(penStrokes, penContext);
        };
    };


    // Lasso Tool
    const src = selectedImage.file;
    const [previewImage, setPreviewImage] = useState();
    const [previewHeight, setPreviewHeight] = useState(200);


    function convertArrayFormat(sourceArray) {
        const goalArray = sourceArray.map(item => [item.x, item.y]);
        return JSON.stringify(goalArray)
    }


    // Renders the Lasso Select canvas over the Pen Tool canvas
    const toggleDisplay = () => {
        setLassoSelectEnabled(!lassoSelectEnabled);
    };


    // Gets Coordinates to be Loaded on Page Load
    useEffect(() => {
        async function fetchCoordinates() {
            if (selectedWord && selectedWord.id) {
                try {
                    const response = await Endpoint.get(`coordinates/${selectedWord.id}/`);
                    const coordinates = response.data.coordinates;

                    // Logic for Loading Points
                    if (coordinates && response.data.toolUsed === "lasso") {
                        const coordPoints = coordinates.map(([x, y]) => ({ x, y }));
                        setPoints(coordPoints);
                    }
                    // else if (coordinates && response.data.toolUsed === "pencil") {       // Disabled Functionality for Loading Pencil Tool Points
                    //     const newPenStroke = {
                    //         path: coordinates.map(([x, y]) => ({
                    //             x: x * scalingFactor,
                    //             y: y * scalingFactor
                    //         })),
                    //         color: 'black',
                    //         width: 2
                    //     };
                    //     setPenStrokes(prev => [...prev, newPenStroke]);
                    //     console.log(penStrokes);
                    // }

                } catch (error) {
                    console.error("Error fetching coordinates:", error);
                }
            }
        }

        fetchCoordinates();
    }, [selectedWord]);


    return (
        <div className="map-tool-container">
            <div className="top-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleBackClick}>Back</button>
                <button onClick={handleUndo} disabled={lassoSelectEnabled}>⟲</button>
                <button onClick={handleRedo} disabled={lassoSelectEnabled}>⟳</button>
                <button onClick={() => setTool('pencil')} disabled={lassoSelectEnabled}>✏️</button>
                {colors.map(color => (
                    <button
                        key={color}
                        className={`color-button ${color}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setPenColor(color)}
                        disabled={lassoSelectEnabled}
                    >
                    </button>
                ))}
                <button onClick={() => setTool('eraser')} disabled={lassoSelectEnabled}>🧽</button>
                <button onClick={handleClearAll} disabled={lassoSelectEnabled}>🗑️ Clear All</button>
                <button onClick={toggleDisplay}>
                    {lassoSelectEnabled ? "Disable Lasso Select" : "Enable Lasso Select"}
                </button>

            </div>

            <div className="image-container">
                { !lassoSelectEnabled && (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={canvasWidth}
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

                { lassoSelectEnabled && (
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

            <div className="selected-word-box">
                <h3>Selected Word: "{selectedWord.word}"</h3>
            </div>


            {/* Provides preview of current lasso selection */}
            {/* { lassoSelectEnabled && (
                <>
                    <h3>Preview</h3>
                    <img src={previewImage} alt="Lasso Preview" height={previewHeight}/>
                </>
            )} */}

        </div>
    );
}

export default MapToolPage;