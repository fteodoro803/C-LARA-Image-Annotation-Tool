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
            goalArrayJSON = convertArrayFormat(lines); // Getting the JSON string

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
        redrawCanvas(actionStack, canvasRef.current.getContext('2d'));
    }, [actionStack]);

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




    const [activeAnnotationIndex, setActiveAnnotationIndex] = useState(null);

    const NEAR_THRESHOLD = 3; // Number of pixels considered 'near' for extending

    const findNearbyAnnotation = (x, y) => {
        for (let i = actionStack.length - 1; i >= 0; i--) {
            const lastPoint = actionStack[i].path[actionStack[i].path.length - 1];
            const distance = Math.sqrt(Math.pow(lastPoint.x - x, 2) + Math.pow(lastPoint.y - y, 2));

            if (distance < NEAR_THRESHOLD) {
                return i;
            }
        }

        return null;
    };


    //sets tool and sets tool characteristics
    const startDrawing = (e) => {
        setIsDrawing(true);

        // Determine if starting near an existing annotation
        const x = e.clientX - canvasRef.current.offsetLeft;
        const y = e.clientY - canvasRef.current.offsetTop;
        const nearbyAnnotationIndex = findNearbyAnnotation(x, y);

        // If near an annotation, set it as the active annotation
        if (nearbyAnnotationIndex !== null) {
            setActiveAnnotationIndex(nearbyAnnotationIndex);
            setLines(actionStack[nearbyAnnotationIndex].path);
        } else {
            setActiveAnnotationIndex(null);
            setLines([{ x, y }]);
        }
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


    //const isLineClosed = (lines) => {
    //if (lines.length < 3) return false; // We assume at least 3 points to form a closed shape

    //const startPoint = lines[0];
    //const endPoint = lines[lines.length - 1];
    //const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));

    //return distance < 5; // Threshold to determine if the start and end points are close enough to form a closed shape
    //};


    const [erasedAnnotations, setErasedAnnotations] = useState([]);


    const stopDrawing = () => {
        setIsDrawing(false);

        if (tool === 'eraser') {
            for (let i = actionStack.length - 1; i >= 0; i--) {
                const action = actionStack[i];
                for (let linePoint of lines) {
                    for (let actionPoint of action.path) {
                        if (Math.abs(linePoint.x - actionPoint.x) < 10 && Math.abs(linePoint.y - actionPoint.y) < 10) {
                            setErasedAnnotations(prev => [...prev, action]);
                        }
                    }
                }
            }
        }

        const newAction = {
            type: tool,
            path: lines,
            color: tool === 'pencil' ? penColor : null,
            width: tool === 'pencil' ? 2 : 10,
        };

        setActionStack(prev => [...prev, newAction]);

        const currentState = saveCanvasState(canvasRef.current);
        setUndoStack(prev => [...prev, currentState]);
        setRedoStack([]);

    };




    const redrawCanvas = (actions, canvasContext) => {
        // Clear only the annotation canvas, not the image canvas
        // canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

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
        const nonErasedAnnotations = actionStack.filter(
            action => !erasedAnnotations.includes(action)
        );

        if (nonErasedAnnotations.length > 0) {
            const recentAnnotation = nonErasedAnnotations[nonErasedAnnotations.length - 1];
            const recentCoordinates = recentAnnotation.path;
            console.log(recentCoordinates);
        } else {
            alert("No annotations have been made.");
        }
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

            {/*<div className="word-choice">*/}
            {/*    <p>Choose words:</p>*/}
            {/*    {enteredWords.map((word, index) => (*/}
            {/*        <button key={index}>{word}</button>*/}
            {/*    ))}*/}
            {/*</div>*/}
            {/*<ReactLassoSelect   // Working React Lasso Select*/}
            {/*    value={points}*/}
            {/*    src={src}*/}
            {/*    onChange={value => {*/}
            {/*        setPoints(value);*/}
            {/*    }}*/}
            {/*    // imageStyle={{ height: `${height}px` }}*/}
            {/*    imageStyle={{ height: `${canvasHeight}px` }}*/}
            {/*    onComplete={value => {*/}
            {/*        if (!value.length) return;*/}
            {/*        getCanvas(src, value, (err, canvas) => {*/}
            {/*            console.log(points)*/}
            {/*        });*/}
            {/*    }}*/}
            {/*/>*/}
        </div>
    );
}

export default MapToolPage;



  
