import React from 'react';
import {Button} from '../ui/button';

interface NavbarProps {
	user: {name: string; role: string};
	onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({user, onLogout}) => {
	return (
		<header className="bg-white border-b border-zinc-200 px-8 py-4 flex justify-between items-center shadow-xs">
			<h1 className="text-lg font-bold text-zinc-900">Internal Expense Dashboard</h1>
			<div className="flex items-center gap-4">
				<span className="text-sm text-zinc-600">
					{user.name} (<strong className="uppercase text-blue-600">{user.role}</strong>)
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={onLogout}
					className="text-red-600 hover:bg-red-50">
					Logout
				</Button>
			</div>
		</header>
	);
};
