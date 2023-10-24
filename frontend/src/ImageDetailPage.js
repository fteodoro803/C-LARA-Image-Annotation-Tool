import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './App.css';

function ImageBox({ url, index, selectedImage, handleImageClick }) {
  return (
      <div
          key={index}
          className={`image-box ${selectedImage === url ? 'selected' : ''}`}
          onClick={() => handleImageClick(index)}
      >
        <img src={url} alt={`Uploaded ${index}`} />
      </div>
  );
}

function EditableWord({ word, index, editedWords, setEditedWords, handleWordEditDone }) {
  return (
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
  );
}

function WordButton({ word, index, selectedWord, handleWordClick }) {
  return (
      <button
          key={index}
          onClick={() => handleWordClick(word)}
          style={{backgroundColor: word === selectedWord ? 'lightgray' : ''}}
      >
        {word}
      </button>
  );
}

function ImageControls({ isEditingMode, editedWords, handleEditButtonClick, handleMapButtonClick, handleWordClick, setEditedWords, handleWordEditDone, selectedWord }) {
  return (
      <div className="controls-container">
        <button className="edit-button" onClick={handleEditButtonClick}>Edit Words</button>
        {isEditingMode ? (
            editedWords.map((word, index) => (
                <EditableWord
                    key={index}
                    word={word}
                    index={index}
                    editedWords={editedWords}
                    setEditedWords={setEditedWords}
                    handleWordEditDone={handleWordEditDone}
                />
            ))
        ) : (
            editedWords.map((word, index) => (
                <WordButton
                    key={index}
                    word={word}
                    index={index}
                    selectedWord={selectedWord}
                    handleWordClick={handleWordClick}
                />
            ))
        )}
        <button className="map-button" onClick={handleMapButtonClick}>Map Tool</button>
      </div>
  );
}


function ImageDetailPage({ images, enteredWords }) {


  const [selectedImage, setSelectedImage] = useState(null);
  const [editedWords, setEditedWords] = useState([...enteredWords]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const navigate = useNavigate();

  const handleImageClick = (index) => {
    setSelectedImage(images[index]);
    //navigate("/maptool");
  };

  const handleEditButtonClick = () => {
    setIsEditingMode(true);
    setSelectedWord(null); //deselect previously selected word
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setIsEditingMode(false); // exit editing mode if it's active
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
    if (!selectedWord) {
      alert('Please select a word first.');
      return;
    }
    navigate('/maptool', {
      state: { 
        selectedImage: selectedImage,
        enteredWords: [selectedWord]  // send only the selected word.
      }
    });
  }

  // return (
  //   <div className="image-detail-container">
  //     <div className="image-list">
  //       {images.map((url, index) => (
  //         <div key={index} className={`image-box ${selectedImage === images[index] ? 'selected' : ''}`} onClick={() => handleImageClick(index)}>
  //         <img src={url} alt={`Uploaded ${index}`} />
  //       </div>
  //     ))}
  //   </div>
  //
  //     {selectedImage && (
  //       <div className="selected-image-container">
  //         <img height={'400px'} width={'auto'} src={selectedImage} alt="Selected" />
  //
  //         <div className="controls-container">
  //           <button className="edit-button" onClick={handleEditButtonClick}>Edit Words</button>
  //
  //           {isEditingMode ? (
  //             editedWords.map((word, index) => (
  //               <input
  //                 key={index}
  //                 type="text"
  //                 value={word}
  //                 onChange={(e) => {
  //                   const newWords = [...editedWords];
  //                   newWords[index] = e.target.value;
  //                   setEditedWords(newWords);
  //                 }}
  //                 onKeyDown={(e) => handleWordEditDone(e, index)}
  //               />
  //             ))
  //           ) : (
  //             editedWords.map((word, index) => (
  //               <button key={index}
  //                       onClick={() => handleWordClick(word)}
  //                       style = {{backgroundColor: word === selectedWord ? 'lightgray' : ''}}
  //               >
  //                 {word}
  //               </button>
  //             ))
  //           )}
  //
  //           <button className="map-button" onClick={handleMapButtonClick}>Map Tool</button>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );

  return (
      <div className="image-detail-container">
        <div className="image-list">
          {images.map((url, index) => (
              <ImageBox
                  key={index}
                  url={url}
                  index={index}
                  selectedImage={selectedImage}
                  handleImageClick={handleImageClick}
              />
          ))}
        </div>

        {selectedImage && (
            <div className="selected-image-container">
              <img height={'400px'} width={'auto'} src={selectedImage} alt="Selected" />
              <ImageControls
                  isEditingMode={isEditingMode}
                  editedWords={editedWords}
                  handleEditButtonClick={handleEditButtonClick}
                  handleMapButtonClick={handleMapButtonClick}
                  handleWordClick={handleWordClick}
                  setEditedWords={setEditedWords}
                  handleWordEditDone={handleWordEditDone}
                  selectedWord={selectedWord}
              />
            </div>
        )}
      </div>
  );
}

export default ImageDetailPage;
