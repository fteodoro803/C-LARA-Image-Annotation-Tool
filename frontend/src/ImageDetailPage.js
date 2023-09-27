import React, { useState } from "react";
import MapToolPage from "./MapToolPage";

function ImageDetailPage({ images, enteredWords }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedWords, setEditedWords] = useState([...enteredWords]);
  const [showMapTool, setShowMapTool] = useState(false); // State to control showing the Map Tool

  const handleImageClick = (index) => {
    setSelectedImage(index);
  };

  const handleEditButtonClick = () => {
    setEditingIndex(selectedImage);
    setEditedWords([...enteredWords]);
  };

  const handleWordBubbleClick = (index) => {
    setEditingIndex(index);
    setEditedWords([...enteredWords]);
  };

  const handleWordEdit = (index, editedWord) => {
    const newWords = [...editedWords];
    newWords[index] = editedWord;
    setEditedWords(newWords);
  };

  const handleWordEditDone = (event, index) => {
    if (event.key === "Enter") {
      setEditingIndex(-1);
      // Save changes to enteredWords or any state you're using
    }
  };

  const handleMapToolClick = () => {
    setShowMapTool(true);
  };

  const handleSaveClick = () => {
    setShowMapTool(false);
  };

  const handleBackClick = () => {
  };

  return (
    <div className="image-detail-container">
      <div className="image-list">
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Uploaded ${index}`}
            onClick={() => handleImageClick(index)}
            className={`image-list-item ${selectedImage === index ? "selected" : ""}`}
          />
        ))}
      </div>
      {selectedImage !== null && !showMapTool && (
        <div className="image-detail">
          <div className="selected-image-container">
            <img
              src={images[selectedImage]}
              alt={`Selected ${selectedImage}`}
              className="selected-image"
            />
          </div>
          <div className="button-container">
            <button className="edit-button" onClick={handleEditButtonClick}>
              Edit Words
            </button>
            <button className="edit-button" onClick={handleMapToolClick}>
              Map Tool
            </button>
          </div>
          <div className="word-container">
            {editedWords.map((word, index) => (
              <div
                key={index}
                className={`word-box ${editingIndex === index ? "editing" : ""}`}
                onClick={() => handleWordBubbleClick(index)}
              >
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleWordEdit(index, e.target.value)}
                    onKeyDown={(e) => handleWordEditDone(e, index)}
                  />
                ) : (
                  word
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {showMapTool && (
        <MapToolPage
          selectedImage={images[selectedImage]}
          enteredWords={editedWords}
          onSaveClick={handleSaveClick}
          onBackClick={handleBackClick}
        />
      )}
    </div>
  );
}

export default ImageDetailPage;