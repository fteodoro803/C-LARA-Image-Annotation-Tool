// Import required dependencies.
// import useFetchWords from "./tools";
// import WordForm from "./tools";
// import {
//     useFetchWords,
//     WordForm,
//     DeleteWordForm,
//     DeleteCoordinateForm,
//     WordCoordinateForm,
//     ImageViewer,
//     ImageUploader,
//     ImageDisplay
// } from "./tools";

import {
    ImageUploader,
    ImageDisplay,
    AddWord, WordManager,
} from "./newTools";

function App() {
  // const words = useFetchWords('http://localhost:8000/api/words/');

  return (
      <div>
          <h2>Add Image</h2>
          <ImageUploader />

            <hr/>

            <h2>Select Images</h2>
          <ImageDisplay  />

          {/*<hr/>*/}
          {/*<h2>Add Words to an Image</h2>*/}
          {/*<AddWord />*/}

          <hr />
          <h2>Word Manager</h2>
          <WordManager />

          {/*<h2>Adding Words to Backend</h2>*/}
          {/*<WordForm />*/}

          {/*<hr/>*/}
         {/* <h2>Delete Word from Backend</h2>*/}
         {/* <DeleteWordForm />*/}

         {/* <h2>Select Word</h2>*/}
         {/* <select>*/}
         {/*     {words.map((word, index) => (*/}
         {/*         <option key={index} value={word.word}>{word.word}</option>*/}
         {/*     ))}*/}
         {/* </select>*/}
         {/* */}
         {/* <hr/>*/}
         {/* /!*<h2>Delete Word and Coordinate Pair from Backend</h2>*!/*/}
         {/* <h2>Delete Coordinate from Backend</h2>*/}
         {/* <DeleteCoordinateForm />*/}

         {/* <hr/>*/}
         {/* <h2>Add Word Coordinate List</h2>*/}
         {/*<WordCoordinateForm />*/}

         {/* <hr/>*/}
         {/* <h2>Upload Images from Backend</h2>*/}
         {/* <ImageUploader />*/}

         {/* <hr/>*/}
         {/* <h2>Select Image from Backend</h2>*/}
         {/* <ImageDisplay />*/}

         {/* <hr/>*/}
         {/* <h2>View All Images from Backend</h2>*/}
         {/* <ImageViewer />*/}

      </div>
  );
}

// Export the App component for use in other modules.
export default App;
