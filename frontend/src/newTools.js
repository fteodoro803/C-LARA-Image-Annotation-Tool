import { useState, useEffect } from 'react';
import axios from 'axios';

export function ImageUploader() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageName, setImageName] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        // Check if a file is selected
        if (file) {
            // Extract the filename without the extension and set it as the imageName
            const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
            setImageName(fileNameWithoutExtension);
        }
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('name', imageName);

        try {
            const response = await axios.post('http://localhost:8000/api/upload/', formData);
            console.log("Uploaded successfully:", response.data);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <div>
            <input type="text" value={imageName} onChange={(e) => setImageName(e.target.value)} placeholder="Enter Image Name" />
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}

export function ImageDisplay() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

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

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/delete/${selectedImage.id}`);
            setSelectedImage(null); // Clear selected image
            // Refetch images to update the dropdown
            const response = await axios.get('http://localhost:8000/api/images/');
            setImages(response.data);
            console.log("Image deleted successfully")
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    return (
        <div>
            <select
                value={selectedImage ? selectedImage.id : ""}
                onChange={(e) => {
                    const selectedID = e.target.value;
                    const selected = images.find(image => image.id.toString() === selectedID);
                    setSelectedImage(selected);
                }}
            >
                <option value="" disabled>Select an image</option>
                {images.map(image => (
                    <option key={image.id} value={image.id}>{image.name}</option>
                ))}
            </select>

            {selectedImage && (
                <div>
                    <img
                        src={selectedImage.file}
                        alt="Selected"
                        style={{
                            maxHeight: '200px',
                            width: 'auto',
                        }}
                    />
                    <button onClick={handleDelete}>Delete</button>
                </div>
            )}
        </div>
    );
}

export function AddWord() {
    const [images, setImages] = useState([]);
    const [selectedImageId, setSelectedImageId] = useState("");
    const [word, setWord] = useState("");

    useEffect(() => {
        // This function will fetch the images when the component mounts
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

    const handleWordSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/add_word/', {
                word,
                image_id: selectedImageId
            });
            console.log("Word added successfully:", response.data);
        } catch (error) {
            console.error("Error adding word:", error);
        }
    };

    return (
        <div>
            <select
                value={selectedImageId}
                onChange={(e) => setSelectedImageId(e.target.value)}
            >
                <option value="" disabled>Select an image</option>
                {images.map(image => (
                    <option key={image.id} value={image.id}>{image.name}</option>
                ))}
            </select>
            <br /> <br />
            <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter a word"
            />

            <button onClick={handleWordSubmit}>Add Word</button>
        </div>
    );
}


export function WordManager() {
    const [images, setImages] = useState([]); // Holds the list of images
    const [selectedImage, setSelectedImage] = useState(null); // Holds the selected image
    const [words, setWords] = useState([]); // Holds the words of the selected image
    const [newWord, setNewWord] = useState(''); // Holds the new word to be added

    useEffect(() => {
        // Fetching images when the component loads
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

    useEffect(() => {
        // Fetching words when an image is selected
        if (selectedImage) {
            const fetchWords = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/words/${selectedImage.id}/`);
                    setWords(response.data);
                    // console.log("Word Ids:", response.data.map(word => word.id)); // Logging word ids
                } catch (error) {
                    console.error("Error fetching words:", error);
                }
            };
            fetchWords();
        }
    }, [selectedImage]);

    const handleImageChange = (event) => {
        const imageId = event.target.value;
        const selected = images.find(image => image.id.toString() === imageId);
        setSelectedImage(selected);
    };

    const handleWordAdd = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/api/add_word/`, {
                word: newWord,
                image_id: selectedImage.id
            });
            console.log("Word added successfully:", response.data);

            // Creating a new word object based on the response
            const newWordData = {
                id: response.data.wordID, // Accessing wordID from the response
                word: response.data.word // Accessing word from the response
            };

            setWords(prevWords => [...prevWords, newWordData]); // Updating the words state
            setNewWord(''); // Clearing the input field
        } catch (error) {
            console.error("Error adding word:", error);
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

    return (
        <div>
            {/* Dropdown for image selection */}
            <select value={selectedImage ? selectedImage.id : ""} onChange={handleImageChange}>
                <option value="" disabled>Select an image</option>
                {images.map(image => (
                    <option key={image.id} value={image.id}>{image.name}</option>))} {/* key is present here */}
            </select>


            {/* Input and button to add a new word */}
            <div>
                <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter a new word"
                />
                <button onClick={handleWordAdd}>Add Word</button>
            </div>

            {/* List of words with delete and edit buttons */}
            <div>
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
                        <button>Map Tool</button>    {/*Do Routing to Map Tool Here*/}
                        <button onClick={() => handleWordDelete(word.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}



export function CoordinateManager() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [words, setWords] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);
    const [coordinates, setCoordinates] = useState('');
    const [displayCoordinates, setDisplayCoordinates] = useState('');


    // Fetching images when the component loads
    useEffect(() => {
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

    // Fetching words when an image is selected
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

    // Updating coordinates when a word is selected
    const handleCoordinateUpdate = async () => {
        try {
            let parsedCoordinates = null;

            if (coordinates) {
                try {
                    parsedCoordinates = JSON.parse(coordinates);
                } catch (error) {
                    console.error("Invalid JSON format:", error);
                    alert("Please enter a valid JSON format for coordinates or leave it blank.");
                    return;
                }
            }

            const response = await axios.post(`http://localhost:8000/api/add_coordinates/`, {
                word_id: selectedWord.id,
                coordinates: parsedCoordinates,
            });

            console.log("Coordinates updated successfully:", response.data);

            // Update displayed coordinates
            setDisplayCoordinates(coordinates);

            setCoordinates(''); // Clearing the input field
        } catch (error) {
            console.error("Error updating coordinates:", error);
        }
    };

    // Fetching coordinates when a word is selected
    useEffect(() => {
        if (selectedWord) {
            fetchCoordinates(selectedWord.id);
        }
    }, [selectedWord])

    const fetchCoordinates = async (wordId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/coordinates/${wordId}/`);
            const coordinates = response.data.coordinates;
            setDisplayCoordinates(JSON.stringify(coordinates));
        } catch (error) {
            console.error("Error fetching coordinates:", error);
        }
    };

    return (
        <div>
            {/* Dropdown for image selection */}
            <select onChange={(e) => setSelectedImage(images.find(image => image.id.toString() === e.target.value))}>
                <option value="" disabled selected>Select an image</option>
                {images.map(image => (
                    <option key={image.id} value={image.id}>{image.name}</option>
                ))}
            </select>

            {/* Dropdown for word selection */}
            <select onChange={(e) => setSelectedWord(words.find(word => word.id.toString() === e.target.value))}>
                <option value="" disabled selected>Select a word</option>
                {words.map(word => (
                    <option key={word.id} value={word.id}>{word.word}</option>
                ))}
            </select>

            {/* Input and button to update coordinates */}
            <div>
                <input
                    type="text"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder='[[x1, y1], [x2, y2], ...]'
                />
                <button onClick={handleCoordinateUpdate}>Update Coordinates</button>
            </div>

            {/* Display coordinates */}
            <div>
                <label>Coordinates:</label>
                <span>{displayCoordinates}</span>
            </div>
        </div>
    );
}