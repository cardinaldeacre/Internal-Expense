import React from 'react';
import {Sidebar} from './Sidebar';

interface DashboardLayoutProps {
	children: React.ReactNode;
	user: {name?: string; role?: string; email?: string};
	onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({children, user, onLogout}) => {
	return (
		<div className="flex h-screen w-full bg-zinc-50 overflow-hidden">
			<Sidebar userRole={user.role || ''} />

			<div className="flex-1 flex flex-col h-full overflow-hidden">
				<header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
					<div>
						<h2 className="text-lg font-semibold text-zinc-800">Halo, {user.name} 👋</h2>
						<p className="text-xs text-zinc-500 capitalize">{user.role?.toLowerCase()}</p>
					</div>
					<button
						onClick={onLogout}
						className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
						Keluar
					</button>
				</header>

				<main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
};
