import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageDetailPage from './ImageDetailPage'; // Adjust the path according to your file structure
import Endpoint from './Endpoints';

// Mocking navigate function from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mocking window.confirm and window.prompt
window.confirm = jest.fn();
window.prompt = jest.fn();

// Mock Endpoint module
jest.mock('./Endpoints', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  put: jest.fn()
}));

test('Add Word button opens a prompt', async () => {
    // Mocking a response for images
    Endpoint.get.mockResolvedValueOnce({ data: [{ id: '1', file: 'http://example.com/image1.png' }] });
  
    render(<ImageDetailPage />);
  
    // Simulate selecting an image, assuming the first image in the list is clicked
    const firstImage = await screen.findByAltText('Uploaded 0');
    fireEvent.click(firstImage);
  
    // Now the Add Word button should be rendered
    const addWordButton = screen.getByText('Add Word');
    fireEvent.click(addWordButton);
  
    expect(window.prompt).toHaveBeenCalled();
  });


  test('Delete button removes word from screen', async () => {
    // Mocking responses
    Endpoint.get
      .mockResolvedValueOnce({ data: [{ id: '1', file: 'http://example.com/image1.png' }] }) // Mock response for images
      .mockResolvedValueOnce({ data: [{ id: 'word1', word: 'WordToDelete' }] }); // Mock response for words
  
    render(<ImageDetailPage />);
  
    // Simulating image selection
    const firstImage = await screen.findByAltText('Uploaded 0');
    fireEvent.click(firstImage);
  
    // Finding and clicking the Delete button
    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);
  
    // Assertions
    expect(Endpoint.delete).toHaveBeenCalledWith('delete_word/word1/');
    // Additional assertion to check if the word is removed from the UI
  });
  
  
  
  test('Back To Upload Page button navigates back', async () => {
    render(<ImageDetailPage />);
  
    const backButton = screen.getByText('Back To Upload Page');
    fireEvent.click(backButton);
  
    // Assert that the navigate function was called with the correct path
  });
    