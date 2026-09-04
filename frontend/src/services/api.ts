import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bankify-banking-dashboard.onrender.com/';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
