import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {PageLayout} from '../../components/layout/PageLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {CreateExpenseModal} from '../../components/expenses/CreateExpenseModal';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {toast} from 'sonner';
import {StatusUpdateModal} from '@/components/expenses/StatusUpdateModal';

export const MyExpensesPage: React.FC = () => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [page] = useState(1);
	const [showModal, setShowModal] = useState(false);
	const [actionData, setActionData] = useState<{
		id: string;
		targetStatus: any;
	} | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const navigate = useNavigate();

	const fetchMyExpenses = async () => {
		setLoading(true);
		try {
			const res = await api.get(
				`/expenses?page=${page}&limit=10&search=${search}&status=${statusFilter}`
			);
			setExpenses(res.data.data?.items || res.data.data || []);
		} catch (err) {
			console.error('Gagal mengambil data pengajuan', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMyExpenses();
	}, [page, search, statusFilter]);

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

	// const handleUpdateStatus = async (id: string, newStatus: string) => {
	// 	try {
	// 		await api.patch(`/expenses/${id}/status`, {status: newStatus});
	// 		fetchMyExpenses();
	// 	} catch (err: any) {
	// 		alert(err.response?.data?.message || 'Gagal mengubah status');
	// 	}
	// };

	const handleTriggerAction = (id: string, newStatus: string) => {
		setActionData({id, targetStatus: newStatus});
	};

	const executeUpdateStatus = async (notes: string) => {
		if (!actionData) return;

		setIsUpdating(true);

		const request = api
			.patch(`/expenses/${actionData.id}/status`, {
				status: actionData.targetStatus,
				notes,
			})
			.finally(() => setIsUpdating(false));

		toast.promise(request, {
			loading: 'Memperbarui status...',
			success: () => {
				setActionData(null);
				fetchMyExpenses();
				return 'Status berhasil diperbarui!';
			},
			error: (err) => err.response?.data?.message || 'Gagal memperbarui status',
		});
	};

	return (
		<DashboardLayout user={user} onLogout={handleLogout}>
			<PageLayout
				title="Pengajuan Saya"
				description="Kelola dan pantau seluruh riwayat pengajuan dana operasional Anda."
				actions={
					<Button
						onClick={() => setShowModal(true)}
						className="bg-blue-600 hover:bg-blue-700 text-white">
						+ Ajukan Expense Baru
					</Button>
				}>
				<div className="flex gap-3 mb-6">
					<Input
						type="text"
						placeholder="Cari judul..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-64 bg-white"
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400">
						<option value="">Semua Status</option>
						<option value="DRAFT">Draft</option>
						<option value="SUBMITTED">Submitted</option>
						<option value="APPROVED">Approved</option>
						<option value="REJECTED">Rejected</option>
						<option value="PAID">Paid</option>
					</select>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
					<ExpenseTable
						expenses={expenses}
						loading={loading}
						userRole={user.role}
						onUpdateStatus={handleTriggerAction}
					/>
				</div>
			</PageLayout>

			<CreateExpenseModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				onSuccess={fetchMyExpenses}
			/>

			<StatusUpdateModal
				isOpen={!!actionData}
				actionType={actionData?.targetStatus || null}
				onClose={() => setActionData(null)}
				onConfirm={executeUpdateStatus}
				isLoading={isUpdating}
			/>
		</DashboardLayout>
	);
};
