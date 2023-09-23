// Import required dependencies.
import React, { Component } from 'react';
import axios from 'axios';
import useFetchWords from "./tools";

// // Define the App class component.
// class App extends Component {
//
//   // Initialize the state with default values.
//   state = {
//     title: '',
//     content: '',
//     image: null,
//     coordinates: ''
//   };
//
//   // This method updates the state based on input field changes.
//   handleChange = (e) => {
//     this.setState({
//       // Use the 'id' attribute of the target element to determine which state property to update.
//       [e.target.id]: e.target.value
//     })
//   };
//
//   // This method updates the state when an image file is selected.
//   handleImageChange = (e) => {
//     this.setState({
//       image: e.target.files[0]  // Get the first (and only) file from the input.
//     })
//   };
//
//   // This method handles the form submission.
//   handleSubmit = (e) => {
//     e.preventDefault();  // Prevent the default form behavior.
//
//     // Print the current state to the console (for debugging purposes).
//     console.log(this.state);
//
//     // Create a FormData object to hold the data to be sent in the POST request.
//     let form_data = new FormData();
//     form_data.append('image', this.state.image, this.state.image.name);
//     form_data.append('title', this.state.title);
//     form_data.append('content', this.state.content);
//     form_data.append('coordinates', this.state.coordinates);
//
//     // Define the API endpoint URL.
//     let url = 'http://localhost:8000/api/posts/';
//
//     // Make a POST request to the API endpoint using axios.
//     axios.post(url, form_data, {
//       headers: {
//         'content-type': 'multipart/form-data'  // Set the request content-type header.
//       }
//     })
//         .then(res => {
//           // On a successful response, log the response data.
//           console.log(res.data);
//         })
//         .catch(err => {
//           // On an error, log the error.
//           console.log(err)
//         })
//   };
//
//   // Define the render method to display the UI.
//   render() {
//     return (
//         <div className="App">
//           {/* Define a form to accept title, content, an image, and coordinates. */}
//           <form onSubmit={this.handleSubmit}>
//             <p>
//               <input type="text" placeholder='Title' id='title' value={this.state.title} onChange={this.handleChange} required/>
//             </p>
//             <p>
//               <input type="text" placeholder='Content' id='content' value={this.state.content} onChange={this.handleChange} required/>
//             </p>
//             <p>
//               <input type="file"
//                      id="image"
//                      accept="image/png, image/jpeg"  onChange={this.handleImageChange} required/>
//             </p>
//             <p>
//               <input type="text" placeholder='Coordinates [x1,y1][x2,y2]' id='coordinates' value={this.state.coordinates} onChange={this.handleChange} required/>
//             </p>
//             <input type="submit"/>
//           </form>
//           <div>
//             <h1>Select a word:</h1>
//             <select>
//               {words.map((word, index) => (
//                   <option key={index} value={word.word}>{word.word}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//     );
//   }
// }

function App() {
  const words = useFetchWords('http://localhost:8000/api/words/');

  return (
      <div>
        <h1>Select a word:</h1>
        <select>
          {words.map((word, index) => (
              <option key={index} value={word.word}>{word.word}</option>
          ))}
        </select>
      </div>
  );
}

// Export the App component for use in other modules.
export default App;
