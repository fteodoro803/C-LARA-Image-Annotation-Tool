import React, {useState, useRef, useEffect, createContext, useContext} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MapTool.css';
import axios from "axios";

import ReactLassoSelect, { getCanvas } from 'react-lasso-select';

//access components of imageDetailPage after navigating from MapToolPage
const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
    const [images, setImages] = useState([]);
    const [words, setWords] = useState([]);

    return (
        <ImageContext.Provider value={{ images, setImages, words, setWords }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImageStore = () => useContext(ImageContext);

function MapToolPage({ onBackClick }) {
    const location = useLocation();
    const selectedImage = location.state?.selectedImage;
    const enteredWords = location.state?.enteredWords;
    const colors = ['black', 'red', 'white','teal'];


    const [points, setPoints] = useState([]);
    const [displayCoordinates, setDisplayCoordinates] = useState('');

    const navigate = useNavigate();


    const handleSave = async () => {
        const goalArrayJSON = convertArrayFormat(points); // Getting the JSON string
        console.log(goalArrayJSON);

        // Implement save logic here
        try {
            // Parsing the JSON string back to an array
            let parsedCoordinates = JSON.parse(goalArrayJSON);

            // Sending the parsed array to the backend
            const response = await axios.post(`http://localhost:8000/api/add_coordinates/`, {
                word_id: enteredWords.id,
                coordinates: parsedCoordinates,
            });

            console.log("Coordinates updated successfully:", response.data);

            // Update displayed coordinates
            setDisplayCoordinates(goalArrayJSON);

            // setPoints([]); // Clearing the points array
        } catch (error) {
            console.error("Error updating coordinates:", error);
        }
    }
    const dropdownRef = useRef(null);

    
    const handleBackClick = () => {
        const userConfirmed = window.confirm("Do you want to save your progress?");
        if (userConfirmed) {
            // Save logic here
            navigate("/imagedetail");
        } else {
            navigate("/imagedetail");
        }
    };


    // Lasso Tool
    const src = selectedImage.file;
    // const [points, setPoints] = useState([]);
    const [clippedImg, setClippedImg] = useState();
    const [height, setHeight] = useState(500);    // make a way to scale the coordinates

    function convertArrayFormat(sourceArray) {
        const goalArray = sourceArray.map(item => [item.x, item.y]);
        return JSON.stringify(goalArray)
    }


    return (
        <div className="map-tool-container">
            <div className="top-buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleBackClick}>Back</button>

                <button>⟲</button>
                <button>⟳</button>

                <button>⏢</button>

                <button>✏️</button>
                {colors.map(color => (
                    <button
                        key={color}
                        className={`color-button ${color}`}
                        style={{ backgroundColor: color }}
                    >
                    </button>
                ))}
                <button>🧽</button>
                <button>🗑️ Clear All</button>
            </div>

            <div className="image-container">
                <ReactLassoSelect
                    value={points}
                    src={src}
                    onChange={value => {
                        setPoints(value);
                    }}
                    imageStyle={{ height: `${height}px` }}
                    onComplete={value => {
                        if (!value.length) return;
                        getCanvas(src, value, (err, canvas) => {
                            console.log(points)
                        });
                    }}
                />
            </div>

            <div className="word-choice">
                <p>Selected word: {enteredWords.word}</p>
            </div>


        </div>
    );
}

export default MapToolPage;
