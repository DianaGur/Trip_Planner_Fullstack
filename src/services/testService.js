import API from './api';

/**
 * Server Connection Testing Utilities
 * 
 * Collection of functions to test and verify server connectivity
 * and API endpoints availability during development and debugging.
 */

/**
 * Tests connection to the API server through configured axios instance
 * Verifies that the API endpoint is accessible and authentication is working
 * 
 * @returns {Promise<Object>} Server response data
 * @throws {Error} When connection fails or server is unreachable
 */
export const testConnection = async () => {
  try {
    const response = await API.get('/test');
    console.log(' Connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error(' Connection failed:', error);
    throw error;
  }
};

/**
 * Tests basic server route without API prefix
 * Direct fetch call to root server endpoint bypassing axios configuration
 * 
 * @returns {Promise<Object>} Basic route response data  
 * @throws {Error} When basic route is inaccessible
 */
export const testBasicRoute = async () => {
  try {
    // Direct call to http://localhost:5000/ (bypasses /api prefix)
    const response = await fetch('/');
    const data = await response.json();
    console.log(' Basic route works:', data);
    return data;
  } catch (error) {
    console.error(' Basic route failed:', error);
    throw error;
  }
};