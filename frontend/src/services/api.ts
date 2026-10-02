import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status } = error.response || {};

        if (status === 401) {
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (status === 403) {
            alert('Access Forbidden: Anda tidak memiliki hak akses untuk aksi ini.');
        } else if (status === 422 || status === 400) {
            console.warn('Validation Error:', error.response?.data?.message);
        } else if (status >= 500) {
            alert('Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.');
        }

        return Promise.reject(error);
    }
);

export default api;