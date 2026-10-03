import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {PageLayout} from '../../components/layout/PageLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {Input} from '../../components/ui/input';

export const DisbursementsPage: React.FC = () => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page] = useState(1);

	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const navigate = useNavigate();

	const fetchDisbursements = async () => {
		setLoading(true);
		try {
			const res = await api.get(`/expenses?page=${page}&limit=10&search=${search}&status=APPROVED`);
			setExpenses(res.data.data?.items || res.data.data || []);
		} catch (err) {
			console.error('Gagal mengambil data pencairan', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDisbursements();
	}, [page, search]);

	const handleLogout = async () => {
		try {
			await api.post('/auth/logout', {}, {skipGlobalError: true} as any);
		} catch (err) {
			console.warn('Sesi berakhir...');
		} finally {
			localStorage.removeItem('csrf_token');
			localStorage.removeItem('user');
			navigate('/login');
		}
	};

	const handleUpdateStatus = async (id: string, newStatus: string) => {
		const notes = prompt('Masukkan nomor referensi transfer / catatan (opsional):') || '';
		try {
			await api.patch(`/expenses/${id}/status`, {status: newStatus, notes});
			fetchDisbursements();
		} catch (err: any) {
			alert(err.response?.data?.message || 'Gagal memproses pencairan');
		}
	};

	return (
		<DashboardLayout user={user} onLogout={handleLogout}>
			<PageLayout
				title="Pencairan Dana (Disbursements)"
				description="Proses pembayaran untuk pengajuan operasional yang telah disetujui."
				actions={
					<Input
						type="text"
						placeholder="Cari penerima / judul..."
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
