import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios'


function ImageDetailPage({ enteredWords }) {


  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editedWords, setEditedWords] = useState([...enteredWords]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch images from the backend
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/images/');
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    fetchImages();
  }, []);

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

  return (
      <div className="image-detail-container">
        <div className="image-list">
          {images.map((imageObj, index) => (
              <div key={imageObj.id} className={`image-box ${selectedImage === imageObj ? 'selected' : ''}`} onClick={() => handleImageClick(index)}>
                <img src={imageObj.file} alt={`Uploaded ${index}`} />
              </div>
          ))}
        </div>

        {selectedImage && (
            <div className="selected-image-container">
              <img height={'400px'} width={'auto'} src={selectedImage.file} alt="Selected" />

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
                        <button key={index}
                                onClick={() => handleWordClick(word)}
                                style = {{backgroundColor: word === selectedWord ? 'lightgray' : ''}}
                        >
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
