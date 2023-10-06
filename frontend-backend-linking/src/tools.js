import { useEffect, useState } from 'react';
import axios from 'axios';

// Get distinct Words from Database
export function useFetchWords(url) {
    const [words, setWords] = useState([]);

    useEffect(() => {
        axios.get(url)
            .then(response => {
                const distinctWords = Array.from(
                    new Set(response.data.map(word => word.word))
                ).map(word => {
                    return response.data.find(item => item.word === word);
                });
                setWords(distinctWords);
            })
            .catch(error => console.error('There was an error fetching the words:', error));
    }, [url]);

    return words;
}
// export default useFetchWords;

// // Get all Words from Database
// function useFetchWords(url) {
//     const [words, setWords] = useState([]);
//
//     useEffect(() => {
//         axios.get(url)
//             .then(response => {
//                 setWords(response.data);
//             })
//             .catch(error => console.error('There was an error fetching the words:', error));
//     }, [url]);  // Dependency array, to rerun the effect if the url changes
//
//     return words;
// }
// export default useFetchWords;



// Adds Words to Database
export function WordForm() {
    const [word, setWord] = useState('');
    const [coordinate, setCoordinate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert comma-separated coordinates to an array
        const coordinateArray = coordinate.split(',').map(coord => parseInt(coord.trim()));

        try {
            const response = await axios.post('http://localhost:8000/api/add_word/', {
                word,
                coordinate: coordinateArray,
            });

            console.log('Data added:', response.data);
        } catch (error) {
            console.error('Error adding data:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Word:
                    <input type="text" value={word} onChange={(e) => setWord(e.target.value)} />
                </label>
            </div>
            <div>
                <label>
                    Coordinates (comma-separated, ex: 1,2):
                    <input type="text" value={coordinate} onChange={(e) => setCoordinate(e.target.value)} />
                </label>
            </div>
            <button type="submit">Add Word</button>
        </form>
    );
}
// export default WordForm;


// Delete selected Word from Database
export function DeleteWordForm() {
    const words = useFetchWords('http://localhost:8000/api/words/');
    const [selectedWord, setSelectedWord] = useState('');

    const handleDelete = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/delete_word/', {
                word: selectedWord
            });
            console.log('Word deleted:', response.data);
        } catch (error) {
            console.error('Error deleting word:', error);
        }
    };

    return (
        <div>
            <select onChange={(e) => setSelectedWord(e.target.value)}>
                <option value="">--Select a word to delete--</option>
                {words.map((wordObj, index) => (
                    <option key={index} value={wordObj.word}>{wordObj.word}</option>
                ))}
            </select>
            <button onClick={handleDelete}>Delete Selected Word</button>
        </div>
    );
}

export function DeleteCoordinateForm() {
    const [word, setWord] = useState('');
    const [coordinate, setCoordinate] = useState('');

    const handleDelete = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/delete_coordinate/', {
                word,
                coordinate
            });
            console.log('Word and Coordinate pair deleted:', response.data);
        } catch (error) {
            console.error('Error deleting word-coordinate pair:', error);
        }
    };

    return (
        <div>
            {/*<label>*/}
            {/*    Word:*/}
            {/*    <input type="text" value={word} onChange={(e) => setWord(e.target.value)} />*/}
            {/*</label>*/}
            <label>
                Coordinate (e.g. [1,2]):
                <input type="text" value={coordinate} onChange={(e) => setCoordinate(e.target.value)} />
            </label>
            {/*<button onClick={handleDelete}>Delete Word and Coordinate Pair</button>*/}
            <button onClick={handleDelete}>Delete Coordinate</button>
        </div>
    );
}


export function WordCoordinateForm() {
    const [word, setWord] = useState('');
    const [coordinate, setCoordinate] = useState('');
    const [coordinatesList, setCoordinatesList] = useState([]);

    const isValidCoordinate = (input) => {
        const regex = /^\[\d+,\d+\]$/; // Regular expression to match [x,y] format
        return regex.test(input);
    };

    const handleAdd = () => {
        if (isValidCoordinate(coordinate)) {
            const coordStripped = coordinate.substring(1, coordinate.length - 1); // remove '[' and ']'
            const coordArray = coordStripped.split(',').map(coord => parseInt(coord.trim()));
            setCoordinatesList(prevList => [...prevList, coordArray]);
            setCoordinate('');  // Clear the input
        } else {
            alert("Invalid coordinate format. Use [x,y]");
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/add_coordinates/', {
                word: word,
                coordinates: coordinatesList
            });
            console.log('Response:', response.data);
            setCoordinatesList([]);  // Clear the list
            setWord('');  // Clear the word input
        } catch (error) {
            console.error('Error sending data:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter word"
            />
            <input
                type="text"
                value={coordinate}
                onChange={(e) => setCoordinate(e.target.value)}
                placeholder="Enter coordinate as [x,y]"
            />
            <button onClick={handleAdd}>Add Coordinate</button>

            <ul>
                {coordinatesList.map((coord, index) => (
                    <li key={index}>[{coord[0]}, {coord[1]}]</li>
                ))}
            </ul>

            <button onClick={handleSubmit}>Submit Word and Coordinates</button>
        </div>
    );
}

export function ImageUploader() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageName, setImageName] = useState("");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
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

export function ImageViewer() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        // Fetch the list of images from the backend
        axios.get('http://localhost:8000/api/list_images/')
            .then(response => {
                setImages(response.data);
            })
            .catch(error => {
                console.error('Error fetching images:', error);
            });
    }, []);

    return (
        <div>
            {images.map(image => (
                <div key={image.imageName}>
                    <h3>{image.imageName}</h3>
                    <img
                        src={`http://localhost:8000${image.imageLocation}`}
                        alt={image.imageName}
                    />
                </div>
            ))}
        </div>
    );
}

export function ImageDisplay() {
    const [images, setImages] = useState([]);
    const [selectedImageName, setSelectedImageName] = useState('');
    const [selectedImageSrc, setSelectedImageSrc] = useState(null);

    useEffect(() => {
        // Fetch the list of images from the backend
        axios.get('http://localhost:8000/api/list_image_names/')
            .then(response => {
                setImages(response.data);
                if (response.data.length > 0) {
                    setSelectedImageName(response.data[0].imageName);
                    setSelectedImageSrc(response.data[0].imageLocation);
                }
            })
            .catch(error => {
                console.error('Error fetching images:', error);
            });
    }, []);

    const handleDropdownChange = (e) => {
        const imageName = e.target.value;
        const image = images.find(img => img.imageName === imageName);
        setSelectedImageName(imageName);
        setSelectedImageSrc(image.imageLocation);
    };

    return (
        <div>
            <select value={selectedImageName} onChange={handleDropdownChange}>
                {images.map(image => (
                    <option key={image.imageName} value={image.imageName}>
                        {image.imageName}
                    </option>
                ))}
            </select>
            <br />
            {selectedImageSrc && <img src={`http://localhost:8000${selectedImageSrc}`} alt={selectedImageName} />}
        </div>
    );
}
