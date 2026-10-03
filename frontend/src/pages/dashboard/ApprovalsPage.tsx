import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {PageLayout} from '../../components/layout/PageLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {Input} from '../../components/ui/input';

export const ApprovalsPage: React.FC = () => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page] = useState(1);

	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const navigate = useNavigate();

	const fetchApprovals = async () => {
		setLoading(true);
		try {
			const res = await api.get(
				`/expenses?page=${page}&limit=10&search=${search}&status=SUBMITTED`
			);
			setExpenses(res.data.data?.items || res.data.data || []);
		} catch (err) {
			console.error('Failed to fetch approvals', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchApprovals();
	}, [page, search]);

	const handleLogout = async () => {
		try {
			await api.post('/auth/logout', {}, {skipGlobalError: true} as any);
		} catch (err) {
			console.warn('Sesi server berakhir...');
		} finally {
			localStorage.removeItem('csrf_token');
			localStorage.removeItem('user');
			navigate('/login');
		}
	};

	const handleUpdateStatus = async (id: string, newStatus: string) => {
		const notes =
			prompt(
				`Masukkan alasan ${newStatus === 'APPROVED' ? 'persetujuan' : 'penolakan'} (opsional):`
			) || '';
		try {
			await api.patch(`/expenses/${id}/status`, {status: newStatus, notes});
			fetchApprovals();
		} catch (err: any) {
			alert(err.response?.data?.message || 'Gagal mengubah status');
		}
	};

	return (
		<DashboardLayout user={user} onLogout={handleLogout}>
			<PageLayout
				title="Persetujuan Pengajuan"
				description="Tinjau dan berikan keputusan untuk pengajuan dana operasional dari staff."
				actions={
					<Input
						type="text"
						placeholder="Cari pengajuan..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-64 bg-white"
					/>
				}>
				<div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
					<ExpenseTable
						expenses={expenses}
						loading={loading}
						userRole={user.role}
						onUpdateStatus={handleUpdateStatus}
					/>
				</div>
			</PageLayout>
		</DashboardLayout>
	);
};
