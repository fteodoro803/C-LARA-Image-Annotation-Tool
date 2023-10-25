import { useNavigate, useLocation } from 'react-router-dom';
import React, {useEffect, useCallback } from 'react';
import { createContext, useContext} from 'react';
import { useState } from 'react';
import ReactLassoSelect, { getCanvas } from 'react-lasso-select';
import './MapTool.css';

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
    const location = useLocation(); //creates instance of location
    const navigate = useNavigate(); //creates instance of navigate
    const selectedImage = location.state?.selectedImage; //access selecedImage state with optional chaining
    const enteredWords = location.state?.enteredWords; //access enetedWords state with optional chaining

    const [points,setPoints] = useState([]); //stores coordinates 


    //const imageCanvasRef = useRef(null);

    

    const handleBackClick = () => {
        const userConfirmed = window.confirm("Do you want to save your progress?");
        if (userConfirmed) {
            navigate("/imagedetail"); //navigate back to imageDetail page
        }
    };

    const handleLasso = () => {
        //to track lasso tool by setting current tool to lasso
        //to be implmented

    }


    const handleUndo = () => {


    }


    const handleRedo = () => {

        
    }



    const handleClearAll = () => {
         //to track lasso tool by setting current tool to lasso
        //to be implmented


        
    }

    const handleDone = () => {
         //send coordinates from points array, url and selected word to backend
        //to be implmented



    }

    const handleEraser = () => {
        //to remove a chose point on lasso tool,
        //able to remove coordinate from points array but 
        //need to redraw the lasso annotation 


    }


    //Render components


    return (
        <div className="map-tool-container">
            <div className="top-buttons">
                <button onClick={handleBackClick}>Back</button>
                <button onClick={handleDone}>Done</button>
                <button onClick={handleUndo}>⟲</button>
                <button onClick={handleRedo}>⟳</button>
                <button onClick={handleLasso}>Lasso</button>
                <button onClick={handleEraser}>🧽</button>
                <button onClick={handleClearAll}>🗑️ Clear All</button>
                


            </div>
            <div className="image-container">
                
                <ReactLassoSelect
                    value= {points}
                    src={selectedImage instanceof File ?  URL.createObjectURL(selectedImage) : selectedImage}
                    onChange={value => {
                        setPoints(value);
                    }}
                    style={{ width: '500px', height: '500px', position: 'relative', zIndex: 0 }}
                    
                />
            </div>
            <div className="word-choice">
                <p>Choose words:</p>
                {enteredWords.map((word, index) => (
                    <button key={index}>{word}</button>
                ))}
            </div>
        </div>
    );
            
}

export default MapToolPage;