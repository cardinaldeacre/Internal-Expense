import React, {createContext, useState, type ReactNode} from 'react';
import type {User} from '../types/auth';
import api from '../services/api';

interface AuthContextType {
	user: User | null;
	login: (userData: User) => void;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
	const [user, setUser] = useState<User | null>(() => {
		const savedUser = localStorage.getItem('user');
		return savedUser ? JSON.parse(savedUser) : null;
	});

	const login = (userData: User) => {
		setUser(userData);
		localStorage.setItem('user', JSON.stringify(userData));
	};

	const logout = async () => {
		try {
			await api.post('/auth/logout', {}, {skipGlobalError: true} as any);
		} catch (err) {
			console.warn('Sesi server berakhir...');
		} finally {
			setUser(null);
			localStorage.removeItem('csrf_token');
			localStorage.removeItem('user');
			window.location.href = '/login';
		}
	};

	return <AuthContext.Provider value={{user, login, logout}}>{children}</AuthContext.Provider>;
};
