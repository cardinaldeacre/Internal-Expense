import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface ErrorResponseData {
    success: boolean;
    message: string;
    error?: string;
}

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const csrfToken = localStorage.getItem('csrf_token');
        const method = config.method ? config.method.toUpperCase() : '';

        if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            config.headers.set('X-CSRF-Token', csrfToken);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        skipGlobalError?: boolean;
    }
}

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorResponseData>) => {
        const status = error.response ? error.response.status : null;
        const errorData = error.response?.data;

        const skipGlobalError = error.config?.skipGlobalError ?? false;

        switch (status) {
            case 401:
                localStorage.removeItem('csrf_token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?session=expired';
                }
                break;

            case 403:
                if (!skipGlobalError) {
                    alert(errorData?.message || 'Akses ditolak: Anda tidak memiliki hak akses untuk tindakan ini.');
                }
                break;

            case 400:
            case 422:
                console.warn('Validasi input gagal:', errorData?.message || error.message);
                break;

            case 429:
                alert('Terlalu banyak permintaan. Mohon tunggu beberapa saat sebelum mencoba lagi.');
                break;

            case 500:
                alert('Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.');
                break;

            default:
                if (!error.response) {
                    alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
                }
                break;
        }

        return Promise.reject(error);
    }
);
export default api;