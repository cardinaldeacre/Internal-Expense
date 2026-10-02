import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../services/api';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';

export const LoginPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const res = await api.post('/auth/login', {email, password});
			if (res.data.success) {
				localStorage.setItem('user', JSON.stringify(res.data.data));
				navigate('/dashboard');
			}
		} catch (err: any) {
			setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
			<div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold tracking-tight">Internal Expense</h2>
					<p className="text-sm text-zinc-400 mt-1">Silakan masuk menggunakan akun perusahaan</p>
				</div>

				{error && (
					<div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
						{error}
					</div>
				)}

				<form onSubmit={handleLogin} className="space-y-4">
					<div className="space-y-2">
						<label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
							Email Address
						</label>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="staff@example.com"
							required
							className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
							Password
						</label>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500"
						/>
					</div>

					<Button
						type="submit"
						disabled={loading}
						className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-md">
						{loading ? 'Authenticating...' : 'Sign In'}
					</Button>
				</form>

				<div className="mt-6 rounded-lg bg-zinc-950/50 p-4 text-xs text-zinc-400 space-y-1 border border-zinc-800/60">
					<p className="font-medium text-zinc-300">Akun Demo Pengujian:</p>
					<p>• Admin: admin@example.com / password123</p>
					<p>• Staff: staff@example.com / password123</p>
					<p>• Manager: manager@example.com / password123</p>
				</div>
			</div>
		</div>
	);
};
