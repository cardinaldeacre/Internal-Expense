import React, {useEffect, useState} from 'react';
import api from '../../services/api';
import {useNavigate} from 'react-router-dom';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {CreateExpenseModal} from '../../components/expenses/CreateExpenseModal';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {StatCards} from '@/components/dashboard/StatCard';

export const DashboardPage: React.FC = () => {
	const [expenses, setExpenses] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [page, setPage] = useState(1);
	const [showModal, setShowModal] = useState(false);

	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const navigate = useNavigate();

	const fetchExpenses = async () => {
		setLoading(true);
		try {
			const res = await api.get(
				`/expenses?page=${page}&limit=5&search=${search}&status=${statusFilter}`
			);
			setExpenses(res.data.data?.items || res.data.data || []);
		} catch (err) {
			console.error('Failed to fetch expenses', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExpenses();
	}, [page, search, statusFilter]);

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
		const notes = prompt('Masukkan catatan / alasan (opsional):') || '';
		try {
			await api.patch(`/expenses/${id}/status`, {status: newStatus, notes});
			fetchExpenses();
		} catch (err: any) {
			alert(err.response?.data?.message || 'Gagal mengubah status');
		}
	};

	const totalExpense = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
	const pendingCount = expenses.filter((e) => e.status === 'SUBMITTED').length;
	const approvedCount = expenses.filter((e) => e.status === 'APPROVED').length;
	const paidTotal = expenses
		.filter((e) => e.status === 'PAID')
		.reduce((acc, curr) => acc + (curr.amount || 0), 0);

	return (
		<DashboardLayout user={user} onLogout={handleLogout}>
			<div className="mb-8">
				<StatCards
					totalExpense={totalExpense}
					pendingCount={pendingCount}
					approvedCount={approvedCount}
					paidTotal={paidTotal}
				/>

				{user.role === 'STAFF' && (
					<div className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
						<div>
							<h3 className="font-semibold text-zinc-800">Ringkasan Pengajuan</h3>
							<p className="text-sm text-zinc-500">
								Pantau status pengeluaran operasional Anda di sini.
							</p>
						</div>
						<Button
							onClick={() => setShowModal(true)}
							className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
							+ Ajukan Expense Baru
						</Button>
					</div>
				)}

				{user.role === 'MANAGER' && (
					<div className="p-5 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
						<h3 className="font-semibold text-amber-900">Perhatian Manager</h3>
						<p className="text-sm text-amber-700">
							Terdapat pengajuan berstatus <strong>SUBMITTED</strong> yang membutuhkan verifikasi
							dan persetujuan Anda. Pastikan untuk memeriksa lampiran sebelum menyetujui.
						</p>
					</div>
				)}

				{user.role === 'FINANCE' && (
					<div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
						<h3 className="font-semibold text-emerald-900">Antrean Pencairan Dana</h3>
						<p className="text-sm text-emerald-700">
							Periksa pengajuan berstatus <strong>APPROVED</strong>. Segera proses pembayaran dan
							perbarui status menjadi PAID jika dana telah ditransfer.
						</p>
					</div>
				)}
			</div>

			<div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
				<div className="flex gap-3 flex-1 max-w-lg">
					<Input
						type="text"
						placeholder="Cari judul / deskripsi..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full bg-zinc-50"
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="rounded-md border border-input bg-zinc-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0">
						<option value="">Semua Status</option>
						<option value="DRAFT">Draft</option>
						<option value="SUBMITTED">Submitted</option>
						<option value="APPROVED">Approved</option>
						<option value="REJECTED">Rejected</option>
						<option value="PAID">Paid</option>
					</select>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
				<ExpenseTable
					expenses={expenses}
					loading={loading}
					userRole={user.role}
					onUpdateStatus={handleUpdateStatus}
				/>
			</div>

			<div className="mt-6 flex items-center justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={() => setPage((prev) => Math.max(1, prev - 1))}
					disabled={page === 1 || loading}
					className="disabled:opacity-50">
					Sebelumnya
				</Button>
				<span className="text-sm font-medium text-zinc-600 bg-white px-4 py-1.5 rounded-full border border-zinc-200">
					Halaman {page}
				</span>
				<Button
					type="button"
					variant="outline"
					onClick={() => setPage((prev) => prev + 1)}
					disabled={loading || expenses.length < 5}
					className="disabled:opacity-50">
					Berikutnya
				</Button>
			</div>

			<CreateExpenseModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				onSuccess={fetchExpenses}
			/>
		</DashboardLayout>
	);
};
