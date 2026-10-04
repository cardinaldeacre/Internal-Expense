import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

export const useAuth = () => {
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { csrfToken, user } = res.data.data;
            localStorage.setItem('csrf_token', csrfToken);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (err) {
            toast.warning('Login gagal. Periksa kembali email dan password.');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {}, { skipGlobalError: true } as any);
        } catch (err) {
            toast.warning('Sesi server berakhir...');
        } finally {
            localStorage.removeItem('csrf_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return { logout, login };
};