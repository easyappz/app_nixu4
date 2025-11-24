import instance from './axios';

/**
 * Register a new user
 * @param {string} username - Username (3-150 characters)
 * @param {string} password - Password (minimum 6 characters)
 * @returns {Promise} Response with token and user data
 */
export const register = async (username, password) => {
  const response = await instance.post('/api/register/', {
    username,
    password,
  });
  
  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

/**
 * Login existing user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} Response with token and user data
 */
export const login = async (username, password) => {
  const response = await instance.post('/api/login/', {
    username,
    password,
  });
  
  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

/**
 * Logout user by removing token from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
};

/**
 * Get stored authentication token
 * @returns {string|null} Token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};
