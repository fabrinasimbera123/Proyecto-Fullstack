import axios from 'axios';
import { updateToken } from '../config/keycloak';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await updateToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      error: true,
      mensaje: 'Error de conexión con el servidor',
    });
  }
);

// 🔹 PELÍCULAS
export const peliculasAPI = {
  getAll: (params = {}) => api.get('/peliculas', { params }),
  getById: (id) => api.get(`/peliculas/${id}`),
  create: (data) => api.post('/peliculas', data),
  update: (id, data) => api.put(`/peliculas/${id}`, data),
  delete: (id) => api.delete(`/peliculas/${id}`),
};

// 🔹 FUNCIONES
export const funcionesAPI = {
  getAll: (params = {}) => api.get('/funciones', { params }),
  getById: (id) => api.get(`/funciones/${id}`),
  create: (data) => api.post('/funciones', data),
  update: (id, data) => api.put(`/funciones/${id}`, data),
  delete: (id) => api.delete(`/funciones/${id}`),
};

// 🔹 ENTRADAS
export const entradasAPI = {
  getAll: (params = {}) => api.get('/entradas', { params }),
  comprar: (items) => api.post('/entradas/comprar', { items }),
  cancelar: (id) => api.delete(`/entradas/${id}`),
};

// 🔹 RESEÑAS
export const resenasAPI = {
  create: (data) => api.post('/resenas', data),
  update: (id, data) => api.put(`/resenas/${id}`, data),
  delete: (id) => api.delete(`/resenas/${id}`),
};

export default api;
