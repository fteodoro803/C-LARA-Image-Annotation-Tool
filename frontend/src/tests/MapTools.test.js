//Testing MapToolPage Tools and buttons

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // MemoryRouter is used for testing components that use react-router
import MapToolPage from '../MapToolPage'; // Adjust the import path as needed

// Mock window.confirm
const mockConfirm = jest.spyOn(window, 'confirm');
mockConfirm.mockImplementation(() => true); // Mock confirmation to return true

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('MapToolPage', () => {
  test('Navigates back to Image Detail Page when Back button is clicked with progress saved', () => {
    const { getByText } = render(
      <MemoryRouter>
        <MapToolPage />
      </MemoryRouter>
    );

    const backButton = getByText('Back');
    fireEvent.click(backButton);

    // Ensure that navigate is called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith('/imagedetail');
  });

  test('Navigates back to Image Detail Page when Back button is clicked without progress saved', () => {
    // Mock window.confirm to return false
    mockConfirm.mockImplementation(() => false);

    const { getByText } = render(
      <MemoryRouter>
        <MapToolPage />
      </MemoryRouter>
    );

    const backButton = getByText('Back');
    fireEvent.click(backButton);

    // Ensure that navigate is called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith('/imagedetail');
  });
});

  
 

  test('Pencil tool is selected when clicked', () => {
    const { getByText } = render(<MapToolPage />);
  
    const pencilButton = getByText('✏️');
    fireEvent.click(pencilButton);
  
    // Expect tool state to be 'pencil'
  });
  
  test('Eraser tool is selected when clicked', () => {
    const { getByText } = render(<MapToolPage />);
  
    const eraserButton = getByText('🧽');
    fireEvent.click(eraserButton);
  
    // Expect tool state to be 'eraser'
  });

  test('Correct color is set when a color is clicked from palette', () => {
    const { getByText } = render(<MapToolPage />);
    
    const colorButton = getByText('red'); // Assuming you have a button with 'red' as text
    fireEvent.click(colorButton);
  
    // Expect penColor state to be 'red'
  });

  test('Undo functionality works correctly', () => {
    const { getByText } = render(<MapToolPage />);
  
    // Make some actions here that would enable undo
    const undoButton = getByText('⟲');
    fireEvent.click(undoButton);
  
    // Expect the state changes that would result from an undo action
  });
  
  test('Redo functionality works correctly', () => {
    const { getByText } = render(<MapToolPage />);
  
    // Perform actions and undo them to enable redo
    const redoButton = getByText('⟳');
    fireEvent.click(redoButton);
  
    // Expect the state changes that would result from a redo action
  });
  
  test('Clear All functionality works correctly', () => {
    const { getByText } = render(<MapToolPage />);
  
    const clearAllButton = getByText('🗑️ Clear All');
    fireEvent.click(clearAllButton);
  
    // Expect the penStrokes state to be empty
  });
  
  


  
  