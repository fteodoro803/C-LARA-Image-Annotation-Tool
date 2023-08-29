import React, { useState } from "react";

function ImageDetailPage({ images, enteredWords }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editedWords, setEditedWords] = useState([...enteredWords]);

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
      {selectedImage !== null && (
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
            <button className="edit-button">Map Tool</button>
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
    </div>
  );
}

export default ImageDetailPage;