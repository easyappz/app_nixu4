import instance from './axios';
import { getToken } from './auth';

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getProfile = async () => {
  const token = getToken();
  
  const response = await instance.get('/api/profile/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
};

/**
 * Update user profile
 * @param {Object} data - Profile data to update
 * @param {string} [data.username] - New username (3-150 characters)
 * @param {string} [data.password] - New password (minimum 6 characters)
 * @returns {Promise} Updated user profile data
 */
export const updateProfile = async (data) => {
  const token = getToken();
  
  const response = await instance.put('/api/profile/', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
};
