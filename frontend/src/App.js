import React, {useEffect, useState} from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import ImageDetailPage from "./ImageDetailPage";
import MapToolPage from "./MapToolPage";
import {
  ImageUploader, ImageDisplay, WordManager, CoordinateManager
} from "./newTools";
import axios from 'axios'

function ImageUploadSection({ handleImageChange }) {
  return (
      <>
        <h2>Upload Images:</h2>
        <input type="file" onChange={handleImageChange} />
      </>
  );
}


function DeleteSelectedButton({ selectedImages, handleDeleteSelected }) {
  if (selectedImages.length === 0) return null;

  return (
      <div>
        <button onClick={handleDeleteSelected}>Delete Selected</button>
      </div>
  );
}

function TextEntrySection({ inputText, handleInputChange, handleDoneClick, enteredWords }) {
  return (
      <>
        <h2>Enter Text:</h2>
        <input type="text" value={inputText} onChange={handleInputChange} />
        <button onClick={handleDoneClick}>Done</button>

        {enteredWords.length > 0 && (
            <div>
              <h2>Entered Words:</h2>
              <div className="word-container">
                {enteredWords.map((word, index) => (
                    <div key={index} className="word-box">
                      {word}
                    </div>
                ))}
              </div>
            </div>
        )}
      </>
  );
}


function MainApp() {


  // Variables
  const [files, setFiles] = useState([]); // Uploaded Image Files
  const [inputText, setInputText] = useState(""); // Input Text
  const [enteredWords, setEnteredWords] = useState([]); // Store the entered words
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showMapToolPage, setShowMapToolPage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Track selected image index
  const [editedWords, setEditedWords] = useState([...enteredWords]);
  const [selectedImages, setSelectedImages] = useState([]); // Maintain a list of selected image indexes
  const navigate = useNavigate();

  // Image Upload Constants and Functions
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



  const [images, setImages] = useState([]);

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/delete/${id}`);
      // Refetch images to update the list after deletion
      const response = await axios.get('http://localhost:8000/api/images/');
      setImages(response.data);
      console.log("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };


  function ImageDisplaySection({ handleImageSelect, selectedImages, setSelectedImageIndex }) {
    return (
        <div className="image-container">
          {images.map((image, index) => (
              <div key={image.id} className="image-item">
                {/*<input*/}
                {/*    type="checkbox"*/}
                {/*    checked={selectedImages.includes(index)}*/}
                {/*    onChange={() => handleImageSelect(index)}*/}
                {/*/>*/}
                <img
                    src={image.file} // Use server's image path
                    alt={`Uploaded ${index}`}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      width: "auto",
                      height: "auto",
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                />
                <button onClick={() => handleDelete(image.id)}>Delete</button>
              </div>
          ))}
        </div>
    );
  }



  function handleProceedClick() {
    navigate("/imagedetail");  // navigate to the imagedetail route
  }


  function handleShowMapToolClick(index) {
    setSelectedImageIndex(index);
    setShowMapToolPage(true);
  }

  // Pushes uploaded images into the local browser
  function handleImageChange(event) {
    const selectedFiles = event.target.files;
    const urls = [];
    for (const file of selectedFiles) {
      urls.push(URL.createObjectURL(file));
    }
    setFiles(urls);
  }


  function handleInputChange(event) {
    setInputText(event.target.value);
  }


  function handleDoneClick() {
    console.log("Uploaded Images:", files);
    console.log("Input Text:", inputText);

    const wordsArray = inputText.split(",").map((word) => word.trim());
    setEnteredWords(wordsArray);
  }


  // Function to toggle the selection status of an image
  const handleImageSelect = (index) => {
    if (selectedImages.includes(index)) {
      setSelectedImages(selectedImages.filter((selected) => selected !== index));
    } else {
      setSelectedImages([...selectedImages, index]);
    }
  };

  // Function to delete selected images
  const handleDeleteSelected = () => {
    const updatedFiles = files.filter((_, index) => !selectedImages.includes(index));
    setSelectedImages([]);
    setFiles(updatedFiles);
    // You may also want to update associated data like enteredWords accordingly.
  };


  return (
      <div className="App">
        <Routes>
          <Route path="/imagedetail" element={<ImageDetailPage images={files} enteredWords={enteredWords} />} />
          <Route path="/maptool" element={<MapToolPage selectedImage={files[selectedImageIndex] || ''} enteredWords={enteredWords} />} />
          <Route path="/" element={
            <div>
              <ImageUploadSection handleImageChange={handleImageChange} />
              <ImageDisplaySection files={files} handleImageSelect={handleImageSelect} selectedImages={selectedImages} setSelectedImageIndex={setSelectedImageIndex} />
              <DeleteSelectedButton selectedImages={selectedImages} handleDeleteSelected={handleDeleteSelected} />
              <TextEntrySection inputText={inputText} handleInputChange={handleInputChange} handleDoneClick={handleDoneClick} enteredWords={enteredWords} />
              <button onClick={handleProceedClick}>Proceed</button>


              <br /><br /><br /><br /><br /><br /><br /><hr />
              <h2>ImageUploadTest</h2>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleUpload}>Upload</button>

              <h2>Image Manager</h2>
              <ImageDisplay />

            </div>
          } />
        </Routes>
      </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;



// Old return in MainApp

// return (
//     <div className="App">
//       <Routes>
//         <Route path="/imagedetail" element={<ImageDetailPage images={files} enteredWords={enteredWords} />} />
//         <Route path="/maptool" element={<MapToolPage selectedImage={files[selectedImageIndex] || ''} enteredWords={enteredWords} />} />
//         <Route path="/" element={
//           <div>
//
//             {/* Upload image functionality*/}
//             <h2>Upload Images:</h2>
//             <input type="file" multiple onChange={handleImageChange} />
//
//             {/* Select and delete uploaded image functionality*/}
//             <div className="image-container">
//               {files.map((url, index) => (
//                 // Shows checkbox above image so users can select multiple images at once to delete
//                 <div key={index} className="image-item">
//
//                   <input
//                     type="checkbox"
//                     checked={selectedImages.includes(index)}
//                     onChange={() => handleImageSelect(index)}
//                   />
//                   <img
//                     src={url}
//                     alt={`Uploaded ${index}`}
//                     style={{
//                       maxWidth: "200px",
//                       maxHeight: "200px",
//                       width: "auto",
//                       height: "auto",
//                     }}
//                     onClick={() => setSelectedImageIndex(index)} // Set selected image index
//                   />
//                 </div>
//               ))}
//             </div>
//
//             {/* If Image are selected, show Delete Selected button and handle local deletion*/}
//             {selectedImages.length > 0 && (
//               <div>
//                 <button onClick={handleDeleteSelected}>Delete Selected</button>
//               </div>
//             )}
//
//             {/* Functionality and display for entering comma separated words*/}
//             <h2>Enter Text:</h2>
//             <input type="text" value={inputText} onChange={handleInputChange} />
//             <button onClick={handleDoneClick}>Done</button>
//             {enteredWords.length > 0 && (
//               <div>
//                 <h2>Entered Words:</h2>
//                 <div className="word-container">
//                   {enteredWords.map((word, index) => (
//                     <div key={index} className="word-box">
//                       {word}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             <button onClick={handleProceedClick}>Proceed</button>
//
//
//             </div>
//
//         } />
//       </Routes>
//     </div>
// );

// Unused functions in MainApp:

// function handleSaveClick() {
//   setEnteredWords(editedWords);
//   setShowMapToolPage(false);
// }
//
// function handleBackClick() {
//   setEditedWords([...enteredWords]);
//   setShowMapToolPage(false);
// }


// Old ImageDisplaySection function
// function ImageDisplaySection({ files, handleImageSelect, selectedImages, setSelectedImageIndex }) {
//
//   return (
//       <div className="image-container">
//         {files.map((url, index) => (
//             <div key={index} className="image-item">
//               <input
//                   type="checkbox"
//                   checked={selectedImages.includes(index)}
//                   onChange={() => handleImageSelect(index)}
//               />
//               <img
//                   src={url}
//                   alt={`Uploaded ${index}`}
//                   style={{
//                     maxWidth: "200px",
//                     maxHeight: "200px",
//                     width: "auto",
//                     height: "auto",
//                   }}
//                   onClick={() => setSelectedImageIndex(index)}
//               />
//             </div>
//         ))}
//       </div>
//   );
// }


// New ImageDisplaySection function



// function ImageDisplaySection() {
//   const [images, setImages] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);
//
//   useEffect(() => {
//     const fetchImages = async () => {
//       try {
//         const response = await axios.get('http://localhost:8000/api/images/');
//         setImages(response.data);
//       } catch (error) {
//         console.error("Error fetching images:", error);
//       }
//     };
//     fetchImages();
//   }, []);
//
//   const handleDelete = async () => {
//     try {
//       await axios.delete(`http://localhost:8000/api/delete/${selectedImage.id}`);
//       setSelectedImage(null);
//       const response = await axios.get('http://localhost:8000/api/images/');
//       setImages(response.data);
//       console.log("Image deleted successfully")
//     } catch (error) {
//       console.error("Error deleting image:", error);
//     }
//   };
//
//   return (
//       <div className="image-container">
//         {images.map((image, index) => (
//             <div key={index} className="image-item">
//               <input
//                   type="checkbox"
//                   checked={selectedImage && selectedImage.id === image.id}
//                   onChange={() => setSelectedImage(image)}
//               />
//               <img
//                   src={image.url}
//                   alt={`Uploaded ${index}`}
//                   style={{
//                     maxWidth: "200px",
//                     maxHeight: "200px",
//                     width: "auto",
//                     height: "auto",
//                   }}
//               />
//               <button onClick={handleDelete}>Delete</button>
//             </div>
//         ))}
//       </div>
//   );
// }