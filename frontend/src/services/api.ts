import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Utilise la variable d'env
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;