import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {LoginPage} from './pages/auth/LoginPage';
import {DashboardPage} from './pages/dashboard/DashboardPage';
import {MyExpensesPage} from './pages/dashboard/MyExpensesPage';
import {ApprovalsPage} from './pages/dashboard/ApprovalsPage';
import {DisbursementsPage} from './pages/dashboard/Disbursementspage';

const ProtectedRoute = ({children}: {children: React.ReactNode}) => {
	const user = localStorage.getItem('user');
	const csrfToken = localStorage.getItem('csrf_token');

	if (!user || !csrfToken) {
		return <Navigate to="/login" replace />;
	}
	return <>{children}</>;
};

const PublicRoute = ({children}: {children: React.ReactNode}) => {
	const user = localStorage.getItem('user');
	if (user) {
		return <Navigate to="/dashboard" replace />;
	}
	return <>{children}</>;
};

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/login"
					element={
						<PublicRoute>
							<LoginPage />
						</PublicRoute>
					}
				/>

				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/my-expenses"
					element={
						<ProtectedRoute>
							<MyExpensesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/approvals"
					element={
						<ProtectedRoute>
							<ApprovalsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/disbursements"
					element={
						<ProtectedRoute>
							<DisbursementsPage />
						</ProtectedRoute>
					}
				/>

				<Route path="*" element={<Navigate to="/dashboard" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
