import instance from './axios';
import { getToken } from './auth';

/**
 * Get message history
 * @param {Object} params - Query parameters
 * @param {number} [params.limit=50] - Number of messages to retrieve (1-100)
 * @param {number} [params.offset=0] - Number of messages to skip
 * @returns {Promise} Object with count and results array of messages
 */
export const getMessages = async (params = {}) => {
  const token = getToken();
  
  const response = await instance.get('/api/messages/', {
    params: {
      limit: params.limit || 50,
      offset: params.offset || 0,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return response.data;
};

/**
 * Send a new message
 * @param {string} text - Message content (max 5000 characters)
 * @returns {Promise} Created message data
 */
export const createMessage = async (text) => {
  const token = getToken();
  
  const response = await instance.post(
    '/api/messages/',
    {
      content: text,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};
