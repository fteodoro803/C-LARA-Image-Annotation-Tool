//Navigate to ImageDetailPage by clicking Proceed button

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn().mockImplementation(() => (path) => {})
}));

// Mock the Endpoint module if necessary to simulate API response
jest.mock('./Endpoints', () => ({
    get: jest.fn().mockResolvedValue({ data: [{ id: 1, file: 'path/to/image.jpg' }] })
}));

describe('MainApp Navigation', () => {
    it('navigates to the ImageDetailPage on Proceed click when images are present', async () => {
        // Render the component
        const { getByText } = render(<App />);

        // Wait for images to load
        // If your component renders something specific when images are present,
        // you can wait for that element to appear
        // ...

        // Simulate clicking the Proceed button
        fireEvent.click(getByText('Proceed'));

        // Assert that navigate has been called with the correct path
        // This assertion depends on your mock of useNavigate
        // Example: expect(mockedNavigate).toHaveBeenCalledWith('/imagedetail');
    });
});




