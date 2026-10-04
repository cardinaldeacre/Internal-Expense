import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Field, FieldError, FieldGroup, FieldLabel} from '@/components/ui/field';
import {useAuth} from '@/hooks/useAuth';

export const LoginPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error] = useState('');
	const [loading] = useState(false);
	const {login} = useAuth();

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-50">
			<Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Internal Expense</CardTitle>
					<CardDescription className="text-zinc-400">
						Silakan masuk menggunakan akun perusahaan
					</CardDescription>
				</CardHeader>

				<CardContent>
					{error && (
						<Alert
							variant="destructive"
							className="mb-4 border-red-500/20 bg-red-500/10 text-red-400">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<form
						onSubmit={(event) => {
							event.preventDefault();
							void login(email, password);
						}}>
						<FieldGroup className="space-y-4">
							<Field>
								<FieldLabel className="text-xs font-medium uppercase tracking-wider text-zinc-400">
									Email Address
								</FieldLabel>
								<Input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="staff@example.com"
									required
									className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500"
								/>
							</Field>

							<Field>
								<FieldLabel className="text-xs font-medium uppercase tracking-wider text-zinc-400">
									Password
								</FieldLabel>
								<Input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									required
									className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-blue-500"
								/>
							</Field>

							{error && <FieldError>{error}</FieldError>}

							<Button
								type="submit"
								disabled={loading}
								className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-md">
								{loading ? 'Authenticating...' : 'Sign In'}
							</Button>
						</FieldGroup>
					</form>
				</CardContent>

				<CardFooter>
					<div className="w-full rounded-lg bg-zinc-950/50 p-4 text-xs text-zinc-400 space-y-1 border border-zinc-800/60">
						<p className="font-medium text-zinc-300">Akun Demo Pengujian:</p>
						<p>• Admin: admin@example.com / password123</p>
						<p>• Staff: staff@example.com / password123</p>
						<p>• Manager: manager@example.com / password123</p>
						<p>• Finance: finance@example.com / password123</p>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};
