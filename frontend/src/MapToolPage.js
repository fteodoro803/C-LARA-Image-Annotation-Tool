import React, { useState, useRef, useEffect } from "react";
import "./MapToolPage.css";

function MapToolPage({
  selectedImage,
  enteredWords,
  onSaveClick,
  onBackClick,
  onShowCurrentMappingClick,
  onShowAnnotatedImageSetClick,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState("pen");
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [tempLine, setTempLine] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    setCanvas(canvas);
    setContext(context);

    // Initialize canvas properties
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineJoin = "round";
    context.lineCap = "round";

    // Add event listeners for drawing
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);

    return () => {
      // Remove event listeners when component unmounts
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  useEffect(() => {
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Draw existing lines from the JSON data here if available
    }
  }, [canvas, context]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    setTempLine([{ x, y }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const newLine = { x, y };
    setTempLine((prevTempLine) => [...prevTempLine, newLine]);
  
    // Draw the line segment on the canvas
    context.beginPath();
    context.moveTo(tempLine[0].x, tempLine[0].y); // Use tempLine instead of prevLine
    context.lineTo(x, y);
    context.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (tempLine.length > 1) {
      // Save the drawn line to the JSON data or perform any other necessary action
    }
    setTempLine([]);
  };

  const handleMouseOut = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Handle mouse out event if necessary
    }
  };

  const handleSaveClick = () => {
    // Save the updated mapping data to the backend (implement backend logic)
    onSaveClick();
  };

  const handleBackClick = () => {
    // Navigate back to the previous page (e.g., ImageDetailPage)
    onBackClick();
  };

  const handleShowCurrentMapping = () => {
    // Show the current mapping data (implement display logic)
    onShowCurrentMappingClick();
  };

  const handleShowAnnotatedImageSet = () => {
    // Show the annotated image set (implement display logic)
    onShowAnnotatedImageSetClick();
  };

  return (
    <div className="map-tool-container">
      <div className="map-tool-image">
        <img
          src={selectedImage}
          alt="Selected Image for Map Tool"
          className="selected-image"
        />
        <canvas
          ref={canvasRef}
          width={selectedImage.width}
          height={selectedImage.height}
          className="canvas"
        />
      </div>
      <div className="map-tool-text">
        <h2>Choose words</h2>
        <div className="word-container">
          {enteredWords.map((word, index) => (
            <div key={index} className="word-box">
              {word}
            </div>
          ))}
        </div>
      </div>
      <div className="map-tool-buttons">
        <button onClick={handleSaveClick} className="edit-button">
          Save
        </button>
        <button onClick={handleBackClick} className="edit-button">
          Back
        </button>
        <button onClick={handleShowCurrentMapping} className="edit-button">
          Show current mapping
        </button>
        <button onClick={handleShowAnnotatedImageSet} className="edit-button">
          Show annotated image set
        </button>
      </div>
    </div>
  );
}

export default MapToolPage;