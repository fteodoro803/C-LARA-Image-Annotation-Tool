# COMP30022-Team-029

## Project Description
- A program that simplifies the mapping experience of a Text Constructor for C-LARA image books by providing tools 
inspired by photo editing software, such as: Lasso Tool, Draw, Erase, Undo, Save.

## Team Members
#### Product Owner:
Fernando Teodoro (fteodoro@student.unimelb.edu.au)

#### Scrum Master:
Nicole Penrose (npenrose@student.unimelb.edu.au)

#### Development Team:
- Fernando Teodoro (fteodoro@student.unimelb.edu.au)
- Jahnavi Datla (jdatla@student.unimelb.edu.au)
- Mahamithra Sivagnanam (msivagnanam@student.unimelb.edu.au)
- Nicole Penrose (npenrose@student.unimelb.edu.au)
- Ranumi Gihansa Wijeyesinghe (rwijeyesingh@student.unimelb.edu.au)

## Features
- Draw Tool: Allows the user to draw on the image.
  - Pen tool: Allows user to draw continuous strokes on the canvas.
  - Eraser tool: Allows user to erase entire strokes. 
  - Undo button: Removes previous action from canvas.
  - Redo button: Restores previously removed action to canvas.
  - Clear all: Clears all annotations from canvas. 
- Lasso Tool: Allows the user to select a region of the image by drawing a closed loop around the region.
  - Selection
    - Click on the Image to start the Lasso Selection process
    - Click around the Area you want to Surround, until you reach the starting point
  - Edit
    - Hold the Point (Box) you want to move
    - Drag to desired location
  - Restart
    - Click on the Image outside of the Selected Area to restart the Process
   
## Demo
  https://github.com/fteodoro803/COMP30022-Team-029/assets/81680451/c02567cf-8373-4476-9b46-97e892ec1481


## Dependencies

#### Frontend:
- [React 18.2](https://react.dev/learn/installation)
- [Axios](https://www.npmjs.com/package/axios)
- [React-lasso-select 1.2.2](https://www.npmjs.com/package/react-lasso-select)
  
#### Backend: 
- [Python 3.10](https://www.python.org/downloads/)
- [Django 4.2.4](https://www.djangoproject.com/download/)
- Pillow 10.0.0 (pip install Pillow)
- Django Rest Framework 3.14.0 (pip install djangorestframework)
- Django CORS Headers 4.2.0 (pip install django-cors-headers)

## Installations

#### Backend: 
1. `cd backend`
2. `python manage.py makemigrations`
3. `python manage.py migrate`

#### Frontend:
1. `cd frontend`
2. `npm install`
3. `npm install axios`
4. `npm install react-lasso-select`

## Running the Program
First, run the backend in Terminal.
Then, run the frontend in a separate Terminal.

#### Backend: 
1. `cd backend`
2. `python manage.py runserver`

#### Frontend:
1. `cd frontend`
2. `npm start`

## Documentation
Relevant documentation is available in PDF format in /docs.

#### Artefacts
- Handover Report: Details about integration into C-LARA and potential extensions. Includes details of the current workflow of our tool and relevant features.
- Product Requirements: User stories and requirements
- Architectural Design: Diagrams and design models

## Changelog

#### Sprint 1
- Created Upload webpage with "Upload Image" and "Add Word" functionality [main]
- Created ImageDetail webpage with "Select Image" and "Edit word" functionality [main]
- Created local server for backend [backend-dev]

#### Sprint 2
- Created basic Mapping Tool webpage interface [frontend-dev]
- Created Database with Post and Word classes [backend-dev]
- Created functions for linking backend and frontend  [frontend-backend-tools]

#### Sprint 3
- Implemented functionality for Pen tool and Erase tool [frontend-dev]
- Implemented functionality for Undo and Redo buttons [frontend-dev]
- Modified Database to be more Modular [backend-dev]
- Fixed CSS issues [frontend-dev]
- Pen tool and Erase tool bugfixes [frontend-dev]
- Undo and Redo button bugfixes [frontend-dev]
- Created Testing functionality for backend, and frontend-backend communication [backend-testing]
- Fixed functions for linking backend and frontend  [frontend-backend-tools]
- Linked frontend and backend [frontend-backend-merge]
- Implemented Lasso tool functionality [frontend-backend-merge]
- All changes merged to release branch [sprint-3-release] 

#### Final Release
- Integrated functionality for pen tool and lasso tool [sprint-3-release-pen-and-lasso]
- Fixed bugs relating to eraser and pen stroke rendering [sprint-3-release-pen-and-lasso]
- Updated eraser tool to erase entire strokes instead of points [sprint-3-release-pen-and-lasso]
- Cleaned up code and repository, added comments [sprint-3-release-pen-and-lasso]
- Merged final release and changes onto main branch [main]

## Testing
Backend testing was conducted in [database-testing]
- Test Cases in `backend/MapTool/tests` directory:
  - testModels.py
  - testViews.py

Frontend unit testing was conducted in the Frontend directory
with a placeholder Backend Environment:
- Test Cases in `frontend/src/tests` directory:
  - Upload page unit tests
     Upload.test.js
     Proceed.test.js
  - ImageDetailPage unit tests
    Words.test.js
  - MapToolPage unit tests
    MapTools.test.js

Testing is still in progress, but is being updated continually in the following Confluence documents:
- [Traceability Matrices](https://team029.atlassian.net/l/cp/as2ChHS7)
- [Front-End Testing Strategy](https://team029.atlassian.net/l/cp/kHBpHiFr)
- [Back-End Testing Process](https://team029.atlassian.net/l/cp/yhE0L0Sw)
- [Bugs](https://team029.atlassian.net/wiki/spaces/SD/pages/10223620/Reported+Bugs?atlOrigin=eyJpIjoiOTdiYjBlOWVhYWIxNDQ5Mzg1MTQ2Y2Q2MGQxMDYyMDIiLCJwIjoiYyJ9)
- [Performance and Stability Test](https://team029.atlassian.net/wiki/spaces/SD/pages/12910757/Performance+and+Stability+Test)

## Acknowledgements
- [Language and Reading Assistant (LARA)](https://www.unige.ch/callector/lara)
- [React Lasso Select](https://www.npmjs.com/package/react-lasso-select)
- [Segment Anything](https://github.com/facebookresearch/segment-anything)
- [ChatGPT-4](https://openai.com/gpt-4)

## License Considerations
- [React Lasso Select - (ISC License)](https://github.com/akcyp/react-lasso-select/blob/main/LICENSE.md)
  - [x] Commercial Use
  - [x] Distribution
  - [x] Modification
  - [x] Private Use
  - [ ] Liability
  - [ ] Warranty
  
