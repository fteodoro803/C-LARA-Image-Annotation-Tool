import React, {useEffect, useState} from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import ImageDetailPage from "./ImageDetailPage";
import MapToolPage from "./MapToolPage";
import Endpoint from "./Endpoints";


function DeleteSelectedButton({ selectedImages, handleDeleteSelected }) {
    if (selectedImages.length === 0) return null;

    return (
        <div>
            <button onClick={handleDeleteSelected}>Delete Selected</button>
        </div>
    );
}


function MainApp() {

    // Variables
    const [files, setFiles] = useState([]); // Uploaded Image Files
    const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Track selected image index
    const [selectedImages, setSelectedImages] = useState([]); // Maintain a list of selected image indexes
    const navigate = useNavigate();

    // Images
    const [images, setImages] = useState([]);

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


    // Pushes image file and metadata to backend
    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('name', imageName);

        try {
            const response = await Endpoint.post('upload/', formData);
            // console.log("Uploaded successfully:", response.data);

            const imagesResponse = await Endpoint.get('images/');

            setImages(imagesResponse.data);

        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };


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


    // Removes image file and metadata from backend
    const handleDelete = async (id) => {
        try {
            await Endpoint.delete(`delete/${id}`);

            // Refetch images to update the list after deletion
            const response = await Endpoint.get('images/');

            setImages(response.data);
            // console.log("Image deleted successfully")
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };


    // Displays the uploaded images in the image container
    function ImageDisplaySection({ setSelectedImageIndex }) {
        return (
            <div className="images-container">
                {images.map((image, index) => (
                    <div key={image.id} className="image-item">
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
                        <button className="small-red-button" onClick={() => handleDelete(image.id)}>Delete</button>
                    </div>
                ))}
            </div>

        );
    }


    // Allows user to proceed to Image Detail page once at least one image has been uploaded
    function handleProceedClick() {
        if (images.length === 0) {
            // Show a popup if there are no images
            alert("There are no images. Please upload an image to proceed.");

        } else {
            // Proceed to the imagedetail route if there are images
            navigate("/imagedetail");
        }
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
    };


    function handleJSONButtonClick() {
        // Redirecting the user to the specified URL
        window.location.href = `${Endpoint.defaults.baseURL}json_output/`;
    }


    return (
        <div className="App">
            <Routes>
                <Route path="/imagedetail" element={<ImageDetailPage images={files} />} />
                <Route path="/maptool" element={<MapToolPage selectedImage={files[selectedImageIndex] || ''} selectedWord />} />
                <Route path="/" element={
                    <div>
                        {/*Image Upload Section*/}
                        <h2>Upload Image:</h2>
                        <input type="file" onChange={handleFileChange} />
                        <button className="small-grey-button" onClick={handleUpload}>Upload</button>

                        {/*Image Display Section*/}
                        <ImageDisplaySection files={files} handleImageSelect={handleImageSelect} selectedImages={selectedImages} setSelectedImageIndex={setSelectedImageIndex} />
                        <DeleteSelectedButton selectedImages={selectedImages} handleDeleteSelected={handleDeleteSelected} />

                        <button className="large-blue-button" onClick={handleProceedClick}>Proceed</button>
                        <br></br>
                        <hr></hr>
                        <button className="large-grey-button" onClick={handleJSONButtonClick}>Generate JSON File</button>
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