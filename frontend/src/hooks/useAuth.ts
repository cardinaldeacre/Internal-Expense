import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { csrfToken, user } = res.data.data;

            localStorage.setItem('csrf_token', csrfToken);

            context.login(user);

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

            await context.logout();

            navigate('/login');
        }
    };

    return {
        user: context.user,
        logout,
        login
    };
};