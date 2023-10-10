import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import ImageDetailPage from "./ImageDetailPage";
import MapToolPage from "./MapToolPage";

function MainApp() {
  const [files, setFiles] = useState([]);
  const [inputText, setInputText] = useState("");
  const [enteredWords, setEnteredWords] = useState([]);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showMapToolPage, setShowMapToolPage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Track selected image index
  const [editedWords, setEditedWords] = useState([...enteredWords]);
  const [selectedImages, setSelectedImages] = useState([]); // Maintain a list of selected image indexes
  const navigate = useNavigate();

  function handleProceedClick() {
    navigate("/imagedetail");  // navigate to the imagedetail route
  }

  function handleShowMapToolClick(index) {
    setSelectedImageIndex(index);
    setShowMapToolPage(true);
  }

  function handleImageChange(event) {
    const selectedFiles = event.target.files;
    const urls = [];
    for (const file of selectedFiles) {
      urls.push(URL.createObjectURL(file));
    }
    setFiles(urls);
  }

  function handleInputChange(event) {
    setInputText(event.target.value);
  }

  function handleDoneClick() {
    console.log("Uploaded Images:", files);
    console.log("Input Text:", inputText);

    const wordsArray = inputText.split(",").map((word) => word.trim());
    setEnteredWords(wordsArray);
  }

  

  function handleSaveClick() {
    setEnteredWords(editedWords);
    setShowMapToolPage(false);
  }

  function handleBackClick() {
    setEditedWords([...enteredWords]);
    setShowMapToolPage(false);
  }

  // Function to toggle the selection status of an image
  const handleImageSelect = (index) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter((selected) => selected !== index));
    } else {
      setSelectedImages([...selectedImages, index]);
    }
  };

  // Function to delete selected images
  const handleDeleteSelected = () => {
    const updatedFiles = files.filter((_, index) => !selectedImages.includes(index));
    setSelectedImages([]);
    setFiles(updatedFiles);
    // You may also want to update associated data like enteredWords accordingly.
  };


  return (
      <div className="App">
        <Routes>
          <Route path="/imagedetail" element={<ImageDetailPage images={files} enteredWords={enteredWords} />} />
          <Route path="/maptool" element={<MapToolPage selectedImage={files[selectedImageIndex] || ''} enteredWords={enteredWords} />} />
          <Route path="/" element={
            <div>
              <h2>Upload Images:</h2>
              <input type="file" multiple onChange={handleImageChange} />
              <div className="image-container">
                {files.map((url, index) => (
                  <div key={index} className="image-item">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(index)}
                      onChange={() => handleImageSelect(index)}
                    />
                    <img
                      src={url}
                      alt={`Uploaded ${index}`}
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        width: "auto",
                        height: "auto",
                      }}
                      onClick={() => setSelectedImageIndex(index)} // Set selected image index
                    />
                  </div>
                ))}
              </div>

              {selectedImages.length > 0 && (
                <div>
                  <button onClick={handleDeleteSelected}>Delete Selected</button>
                </div>
              )}

              <h2>Enter Text:</h2>
              <input type="text" value={inputText} onChange={handleInputChange} />
              <button onClick={handleDoneClick}>Done</button>
              {enteredWords.length > 0 && (
                <div>
                  <h2>Entered Words:</h2>
                  <div className="word-container">
                    {enteredWords.map((word, index) => (
                      <div key={index} className="word-box">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleProceedClick}>Proceed</button>
              </div>
          } />
        </Routes>
      </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
