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

  const [words, setWords] = useState([]); // Holds the words of the selected image
  const [newWord, setNewWord] = useState('');

  useEffect(() => {
    if (selectedImage) {
      const fetchWords = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/words/${selectedImage.id}/`);
          setWords(response.data);
        } catch (error) {
          console.error("Error fetching words:", error);
        }
      };
      fetchWords();
    }
  }, [selectedImage]);

  const handleWordAdd = async () => {
    const newWordValue = prompt("Enter a new word:");

    if (newWordValue) {
      try {
        const response = await axios.post(`http://localhost:8000/api/add_word/`, {
          word: newWordValue,
          image_id: selectedImage.id
        });

        // Assuming the backend returns the added word, you can append it to the editedWords list.
        const newWordData = response.data.word; // Adjust this path as per your API response structure
        setEditedWords(prevWords => [...prevWords, newWordData]);
      } catch (error) {
        console.error("Error adding word:", error);
      }
    }
  };

  const handleWordDelete = async (wordId) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete_word/${wordId}/`);
      console.log("Word deleted successfully");
      setWords(prevWords => prevWords.filter(word => word.id !== wordId)); // Updating the word list
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const handleWordEdit = async (wordId, newWord) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/edit_word/${wordId}/`, {
        word: newWord,
      });
      console.log("Word edited successfully:", response.data);
      setWords(prevWords =>
          prevWords.map(word =>
              word.id === wordId ? {...word, word: newWord} : word
          )
      );
    } catch (error) {
      console.error("Error editing word:", error);
    }
  };


  const handleMapButtonClickForWord = (word) => {
    if (!word) {
      alert('Please select a word first.');
      return;
    }
    navigate('/maptool', {
      state: {
        selectedImage: selectedImage,
        enteredWords: [word] // send only the selected word.
      }
    });
  };


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
                <button onClick={handleWordAdd}>Add Word</button>
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
                    <>
                      {words.map(word => (
                          <div key={word.id}>
                            {word.word}
                            <button
                                onClick={() => {
                                  const newWord = prompt("Edit word:", word.word);
                                  if (newWord) {
                                    handleWordEdit(word.id, newWord);
                                  }
                                }}
                            >
                              Edit
                            </button>
                            <button onClick={() => handleMapButtonClickForWord(word.word)}>Map</button>
                            <button onClick={() => handleWordDelete(word.id)}>Delete</button>
                          </div>
                      ))}
                      <button className="edit-button" onClick={handleEditButtonClick}>Edit Words</button>
                      <button className="map-button" onClick={handleMapButtonClick}>Map Tool</button>
                    </>
                )}
              </div>
            </div>
        )}
      </div>
  );


  // return (
  //     <div className="image-detail-container">
  //       <div className="image-list">
  //         {images.map((imageObj, index) => (
  //             <div key={imageObj.id} className={`image-box ${selectedImage === imageObj ? 'selected' : ''}`} onClick={() => handleImageClick(index)}>
  //               <img src={imageObj.file} alt={`Uploaded ${index}`} />
  //             </div>
  //         ))}
  //       </div>
  //
  //       {selectedImage && (
  //           <div className="selected-image-container">
  //             <img height={'400px'} width={'auto'} src={selectedImage.file} alt="Selected" />
  //
  //             <div className="controls-container">
  //
  //
  //               <button className="edit-button" onClick={handleEditButtonClick}>Edit Words</button>
  //
  //               {isEditingMode ? (
  //                   editedWords.map((word, index) => (
  //                       <input
  //                           key={index}
  //                           type="text"
  //                           value={word}
  //                           onChange={(e) => {
  //                             const newWords = [...editedWords];
  //                             newWords[index] = e.target.value;
  //                             setEditedWords(newWords);
  //                           }}
  //                           onKeyDown={(e) => handleWordEditDone(e, index)}
  //                       />
  //                   ))
  //               ) : (
  //                   editedWords.map((word, index) => (
  //                       <button key={index}
  //                               onClick={() => handleWordClick(word)}
  //                               style = {{backgroundColor: word === selectedWord ? 'lightgray' : ''}}
  //                       >
  //                         {word}
  //                       </button>
  //                   ))
  //               )}
  //
  //               <button className="map-button" onClick={handleMapButtonClick}>Map Tool</button>
  //             </div>
  //           </div>
  //       )}
  //     </div>
  // );

}

export default ImageDetailPage;



// Old return stuff

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