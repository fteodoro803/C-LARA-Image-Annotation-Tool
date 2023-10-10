import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './App.css';

function ImageDetailPage({ images, enteredWords }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [editedWords, setEditedWords] = useState([...enteredWords]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const navigate = useNavigate();

  const handleImageClick = (index) => {
    setSelectedImage(images[index]);
    //navigate("/maptool");
  };

  const handleEditButtonClick = () => {
    setIsEditingMode(!isEditingMode);
  };

  const handleWordEditDone = (e, index) => {
    if (e.key === "Enter") {
      const newWords = [...editedWords];
      newWords[index] = e.target.value;
      setEditedWords(newWords);
      setIsEditingMode(false);
    }
  };

  const handleMapButtonClick = () => {
    navigate('/maptool', {
      state: { 
        selectedImage: selectedImage,
        enteredWords: editedWords 
      }
    });
  }

  return (
    <div className="image-detail-container">
      <div className="image-list">
        {images.map((url, index) => (
          <div key={index} className="image-box" onClick={() => handleImageClick(index)}>
            <img src={url} alt={`Uploaded ${index}`} />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="selected-image-container">
          <img src={selectedImage} alt="Selected" />

          <div className="controls-container">
            <button className="edit-button" onClick={handleEditButtonClick}>Edit Words</button>

            {isEditingMode ? (
              editedWords.map((word, index) => (
                <input
                  key={index}
                  type="text"
                  value={word}
                  onChange={(e) => {
                    const newWords = [...editedWords];
                    newWords[index] = e.target.value;
                    setEditedWords(newWords);
                  }}
                  onKeyDown={(e) => handleWordEditDone(e, index)}
                />
              ))
            ) : (
              editedWords.map((word, index) => (
                <button key={index} onClick={() => setIsEditingMode(true)}>
                  {word}
                </button>
              ))
            )}

            <button className="map-button" onClick={handleMapButtonClick}>Map Tool</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageDetailPage;