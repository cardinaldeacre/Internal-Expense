import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';

interface ErrorResponseData {
    success: boolean;
    message: string;
    error?: string;
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getCSRFToken = (): string | null => {
    const localToken = localStorage.getItem('csrf_token');

    if (
        localToken &&
        localToken !== 'undefined' &&
        localToken !== 'null'
    ) {
        return localToken;
    }

    const match = document.cookie.match(
        new RegExp('(^| )csrf_token=([^;]+)')
    );

    if (match) {
        return match[2];
    }

    return null;
};

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const csrfToken = getCSRFToken();
        const method = config.method
            ? config.method.toUpperCase()
            : '';

        if (
            csrfToken &&
            ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        ) {
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
        const status = error.response
            ? error.response.status
            : null;

        const errorData = error.response?.data;

        const skipGlobalError =
            error.config?.skipGlobalError ?? false;

        switch (status) {
            case 401:
                localStorage.removeItem('csrf_token');
                localStorage.removeItem('user');

                if (window.location.pathname !== '/login') {
                    window.location.href =
                        '/login?session=expired';
                }
                break;

            case 403:
                if (!skipGlobalError) {
                    toast.error(
                        errorData?.message ||
                        'Akses Ditolak: Anda tidak memiliki hak akses.'
                    );
                }
                break;

            case 400:
            case 422:
                toast.warning(
                    `Validasi input gagal: ${errorData?.message || error.message
                    }`
                );
                break;

            case 429:
                toast.warning(
                    'Terlalu banyak permintaan. Mohon tunggu beberapa saat sebelum mencoba lagi.'
                );
                break;

            case 500:
                toast.error(
                    'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.'
                );
                break;

            default:
                if (!error.response) {
                    toast.error(
                        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
                    );
                }
                break;
        }

        return Promise.reject(error);
    }
);

export default api;