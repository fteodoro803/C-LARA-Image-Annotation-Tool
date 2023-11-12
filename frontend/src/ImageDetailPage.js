import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './App.css';
import Endpoint from "./Endpoints";


function ImageDetailPage() {

    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editedWords, setEditedWords] = useState([]);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const navigate = useNavigate();

    const [wordAddCount, setWordAddCount] = useState(0);  // Counter to Trigger Image-Word Loader when updated
    const [words, setWords] = useState([]); // Holds the words of the selected image


    useEffect(() => {
        // Fetch images from the backend
        const fetchImages = async () => {
            try {
                const response = await Endpoint.get('images/');

                setImages(response.data);
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };
        fetchImages();
    }, []);


    const handleImageClick = (index) => {
        setSelectedImage(images[index]);
    };


    // Gets Words of the Image
    useEffect(() => {
        if (selectedImage) {
            const fetchWords = async () => {
                try {
                    const response = await Endpoint.get(`words/${selectedImage.id}/`);
                    setWords(response.data);
                } catch (error) {
                    console.error("Error fetching words:", error);
                }
            };
            fetchWords();
        }
    }, [selectedImage, wordAddCount]);


    // Adds word to database and renders on page
    const handleWordAdd = async () => {
        const newWordValue = prompt("Enter a new word:");

        if (newWordValue) {
            try {
                const response = await Endpoint.post(`add_word/`, {
                    word: newWordValue,
                    image_id: selectedImage.id
                });

                // Check if the status code indicates success
                if (response.status >= 200 && response.status < 300) {
                    if (response.data && response.data.word) {
                        const newWordData = response.data.word;
                        setEditedWords(prevWords => [...prevWords, newWordData]);
                        setWords(prevWords => [...prevWords, newWordData]);
                        setWordAddCount(prevCount => prevCount + 1); // Increment the counter to trigger the useEffect hook (to reload the words)
                    } else {
                        console.error("Unexpected response structure:", response.data);
                        alert('Word added but there was an issue displaying it.');
                    }
                } else {
                    console.error("Error adding word. Status code:", response.status);
                    alert('There was an issue adding the word. Please try again.');
                }

            } catch (error) {
                console.error("Error adding word:", error);
                alert('There was an error while adding the word. Please check console for more details.');
            }
        }
    };


    // Removes word metadata from backend
    const handleWordDelete = async (wordId) => {
        try {
            await Endpoint.delete(`delete_word/${wordId}/`);
            // console.log("Word deleted successfully");
            setWords(prevWords => prevWords.filter(word => word.id !== wordId)); // Updating the word list
        } catch (error) {
            console.error("Error deleting word:", error);
        }
    };


    // Helper function for the Edit Word popup
    const handleWordEditDone = (e, index) => {
        if (e.key === "Enter") {
            const newWords = [...editedWords];
            newWords[index] = e.target.value;
            setEditedWords(newWords);
            setIsEditingMode(false);
        }
    };


    // Updates the 'word' attribute of the edited word in backend
    const handleWordEdit = async (wordId, newWord) => {
        try {
            const response = await Endpoint.put(`edit_word/${wordId}/`, {
                word: newWord,
            });
            // console.log("Word edited successfully:", response.data);
            setWords(prevWords =>
                prevWords.map(word =>
                    word.id === wordId ? {...word, word: newWord} : word
                )
            );
        } catch (error) {
            console.error("Error editing word:", error);
        }
    };


    // Redirects user to mapping tool for chosen image and word
    const handleMapButtonClick = (selectedImage, word) => {
        // console.log(selectedImage, word)
        if (!word) {
            alert('Please select a word first.');
            return;
        }
        navigate('/maptool', {
            state: {
                selectedImage: selectedImage,
                selectedWord: word
            }
        });
    };


    // Redirects user back to Upload Page
    const handleBackButtonClick = () => {
        navigate('/');
    };


    return (

        <div className="image-detail-container">
            <button className="large-blue-button" onClick={handleBackButtonClick}>Back To Upload Page</button>
            <h2>Select Image:</h2>
            <div className="image-list">
                {images.map((imageObj, index) => (
                    <div key={imageObj.id} className={`image-box ${selectedImage === imageObj ? 'selected' : ''}`} onClick={() => handleImageClick(index)}>
                        <img src={imageObj.file} alt={`Uploaded ${index}`} />
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="selected-image-container">
                    <div className="selected-image">
                        <img height={'400px'} width={'auto'} src={selectedImage.file} alt="Selected" />
                    </div>
                    <div className="controls-container">
                        <button className="large-blue-button" onClick={handleWordAdd}>Add Word</button>
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
                                    <div className="word-box" key={word.id}>
                                        <div className="word-item">
                                            {word.word}
                                        </div>
                                        <button
                                            className="small-grey-button"
                                            onClick={() => {
                                                const newWord = prompt("Edit word:", word.word);
                                                if (newWord) {
                                                    handleWordEdit(word.id, newWord);
                                                }
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button className="small-red-button" onClick={() => handleWordDelete(word.id)}>Delete</button>
                                        <button className="small-blue-button" onClick={() => handleMapButtonClick(selectedImage, word)}>Map</button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageDetailPage;