import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {LoginPage} from '@/pages/auth/LoginPage';
import {DashboardPage} from '@/pages/dashboard/DashboardPage';

export const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/dashboard" element={<DashboardPage />} />
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
