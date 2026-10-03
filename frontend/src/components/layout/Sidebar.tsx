import React from 'react';
import {Link, useLocation} from 'react-router-dom';

interface SidebarProps {
	userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({userRole}) => {
	const location = useLocation();

	const menuItems = [
		{name: 'Dashboard', path: '/dashboard', roles: ['STAFF', 'MANAGER', 'FINANCE']},
		{name: 'Pengajuan Saya', path: '/my-expenses', roles: ['STAFF']},
		{name: 'Persetujuan', path: '/approvals', roles: ['MANAGER']},
		{name: 'Pencairan Dana', path: '/disbursements', roles: ['FINANCE']},
	];

	const allowedMenus = menuItems.filter((menu) => menu.roles.includes(userRole));

	return (
		<aside className="w-64 bg-slate-900 text-slate-300 shrink-0 hidden md:flex md:flex-col h-full">
			<div className="h-16 flex items-center px-6 font-bold text-white text-xl tracking-wide border-b border-slate-800">
				ExpenSys
			</div>
			<nav className="flex-1 py-6 space-y-2 px-4">
				{allowedMenus.map((menu) => {
					const isActive = location.pathname === menu.path;
					return (
						<Link
							key={menu.name}
							to={menu.path}
							className={`block px-4 py-2.5 rounded-lg transition-colors ${
								isActive
									? 'bg-blue-600 text-white font-medium shadow-md'
									: 'hover:bg-slate-800 hover:text-white'
							}`}>
							{menu.name}
						</Link>
					);
				})}
			</nav>
			<div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
				&copy; 2026 Internal Expense
			</div>
		</aside>
	);
};
