import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the Endpoint module
jest.mock('./Endpoints', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn()
}));

import App from './App'; // Assuming your component is named 'App'
import Endpoint from './Endpoints';

test('image upload function', async () => {
  // Mocking API response
  Endpoint.post.mockResolvedValueOnce({ data: 'Mock response' });
  Endpoint.get.mockResolvedValueOnce({ data: [] });

  render(<App />);

  // Find and interact with file input
  const fileInput = screen.getByTestId('file-upload');
  const mockFile = new File(['mock-image-content'], 'test-image.png', { type: 'image/png' });
  userEvent.upload(fileInput, mockFile);

  // Find and click the upload button
  const uploadButton = screen.getByRole('button', { name: /Upload/i });
  fireEvent.click(uploadButton);

  // Assertions
  expect(Endpoint.post).toHaveBeenCalledWith('upload/', expect.any(FormData));
  // Additional assertions can be added here
});

test('deleting an image removes it from the preview', async () => {
  // Mock the upload process
  const mockImage = { id: '1', file: 'http://example.com/mockImage.png' };
  Endpoint.post.mockResolvedValueOnce({ data: mockImage });
  Endpoint.get.mockResolvedValueOnce({ data: [mockImage] }); // Initial fetch with the uploaded image

  // Render the component
  render(<App />);

  // Simulate file upload
  const fileInput = screen.getByTestId('file-upload');
  const mockFile = new File(['mock-image-content'], 'test-image.png', { type: 'image/png' });
  userEvent.upload(fileInput, mockFile);

  const uploadButton = screen.getByRole('button', { name: /Upload/i });
  fireEvent.click(uploadButton);

  // Wait for the image to be displayed
  const displayedImage = await screen.findByAltText('Uploaded 0');

  // Mock the delete process
  Endpoint.delete.mockResolvedValueOnce({});
  Endpoint.get.mockResolvedValueOnce({ data: [] }); // Fetch after deletion, returning no images

  // Simulate clicking the delete button associated with the uploaded image
  const deleteButton = screen.getByText('Delete'); // Find the delete button
  fireEvent.click(deleteButton);

  // Wait and check if the image has been removed
  await waitFor(() => {
    expect(screen.queryByAltText('Uploaded 0')).toBeNull(); // The image should no longer be in the document
  });
});

  

  









