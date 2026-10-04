import React, {useEffect, useState} from 'react';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {CreateExpenseModal} from '../../components/expenses/CreateExpenseModal';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {StatCards} from '@/components/dashboard/StatCard';
import {StatusUpdateModal} from '@/components/expenses/StatusUpdateModal';
import {useAuth} from '@/hooks/useAuth';
import {useExpense} from '@/hooks/useExpense';
import type {ExpenseStatus} from '@/types/expense';

export const DashboardPage: React.FC = () => {
	const {expenses, loading, fetchExpenses, updateExpenseStatus} = useExpense();
	const {logout} = useAuth();

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [page, setPage] = useState(1);
	const [showModal, setShowModal] = useState(false);

	const [actionData, setActionData] = useState<{
		id: string;
		targetStatus: ExpenseStatus;
	} | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const user = JSON.parse(localStorage.getItem('user') || '{}');

	useEffect(() => {
		fetchExpenses({page, limit: 5, search, status: statusFilter});
	}, [page, search, statusFilter, fetchExpenses]);

	const handleTriggerAction = (id: string, newStatus: ExpenseStatus) => {
		setActionData({id, targetStatus: newStatus});
	};

	const executeStatusUpdate = async (notes: string) => {
		if (!actionData) return;
		setIsUpdating(true);

		try {
			await updateExpenseStatus(actionData.id, actionData.targetStatus, notes);
			setActionData(null);
		} finally {
			setIsUpdating(false);
		}
	};

	const totalExpense = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
	const pendingCount = expenses.filter((e) => e.status === 'SUBMITTED').length;
	const approvedCount = expenses.filter((e) => e.status === 'APPROVED').length;
	const paidTotal = expenses
		.filter((e) => e.status === 'PAID')
		.reduce((acc, curr) => acc + (curr.amount || 0), 0);
	return (
		<DashboardLayout user={user} onLogout={logout}>
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
					onUpdateStatus={handleTriggerAction}
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

			<StatusUpdateModal
				isOpen={!!actionData}
				actionType={actionData?.targetStatus || null}
				onClose={() => setActionData(null)}
				onConfirm={executeStatusUpdate}
				isLoading={isUpdating}
			/>
		</DashboardLayout>
	);
};
