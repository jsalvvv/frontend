// frontend/src/App.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

// Mock Axios
jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    axios.post.mockClear();
  });

  test('renders the main interface correctly', () => {
    render(<App />);
    
    expect(screen.getByText(/API Integration Code Generator Demo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Endpoint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HTTP Method/i)).toBeInTheDocument();
    expect(screen.getByText(/Parameters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Code/i)).toBeInTheDocument();
  });

  test('allows user to input API details and generates code', async () => {
    // Mock the API response
    const mockCode = `
import axios from 'axios';

const fetchData = async (userId) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users', {
            params: { userId }
        });
        console.log(response.data);
        // TODO: Add visualization logic here
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

fetchData(userId);
    `;
    axios.post.mockResolvedValueOnce({ data: { code: mockCode } });

    render(<App />);

    // Input API Endpoint
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/api\.example\.com\/v1\/data/i), {
      target: { value: 'https://jsonplaceholder.typicode.com/users' },
    });

    // Select HTTP Method
    fireEvent.change(screen.getByLabelText(/HTTP Method/i), {
      target: { value: 'GET' },
    });

    // Input Parameter Name
    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: 'userId' },
    });

    // Select Parameter Type
    fireEvent.change(screen.getByLabelText(/Type/i), {
      target: { value: 'number' },
    });

    // Select Language
    fireEvent.change(screen.getByLabelText(/Language/i), {
      target: { value: 'JavaScript' },
    });

    // Click Generate Code
    fireEvent.click(screen.getByText(/Generate Code/i));

    // Wait for the generated code to appear
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    // Verify that Axios was called with correct parameters
    expect(axios.post).toHaveBeenCalledWith('/generate-code', {
      endpoint: 'https://jsonplaceholder.typicode.com/users',
      method: 'GET',
      params: [{ name: 'userId', type: 'number' }],
      language: 'JavaScript',
    });

    // Check if the generated code is displayed
    expect(await screen.findByText(/import axios from 'axios';/i)).toBeInTheDocument();
    expect(screen.getByText(/const fetchData = async \(userId\) => {/i)).toBeInTheDocument();
  });

  test('displays an error message when API call fails', async () => {
    // Mock the API to reject
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Unsupported language.' } },
    });

    render(<App />);

    // Input API Endpoint
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/api\.example\.com\/v1\/data/i), {
      target: { value: 'https://invalid-endpoint.com/api' },
    });

    // Select HTTP Method
    fireEvent.change(screen.getByLabelText(/HTTP Method/i), {
      target: { value: 'GET' },
    });

    // Click Generate Code without parameters
    fireEvent.click(screen.getByText(/Generate Code/i));

    // Wait for the error message to appear
    expect(await screen.findByText(/Unsupported language\./i)).toBeInTheDocument();
  });
});