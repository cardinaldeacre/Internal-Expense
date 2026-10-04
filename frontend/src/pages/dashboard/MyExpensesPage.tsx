import React, {useEffect, useState} from 'react';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {PageLayout} from '../../components/layout/PageLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {CreateExpenseModal} from '../../components/expenses/CreateExpenseModal';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {StatusUpdateModal} from '@/components/expenses/StatusUpdateModal';
import {useExpense} from '@/hooks/useExpense';
import {useAuth} from '@/hooks/useAuth';
import {Navigate} from 'react-router-dom';

export const MyExpensesPage: React.FC = () => {
	const {expenses, loading, fetchExpenses, updateExpenseStatus} = useExpense();
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [page] = useState(1);
	const [showModal, setShowModal] = useState(false);
	const [actionData, setActionData] = useState<{
		id: string;
		targetStatus: any;
	} | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const {logout} = useAuth();

	const user = JSON.parse(localStorage.getItem('user') || '{}');

	useEffect(() => {
		fetchExpenses({
			page,
			limit: 10,
			search,
			status: statusFilter,
		});
	}, [page, search, statusFilter, fetchExpenses]);

	const handleTriggerAction = (id: string, newStatus: string) => {
		setActionData({id, targetStatus: newStatus});
	};

	const executeUpdateStatus = async (notes: string) => {
		if (!actionData) return;

		setIsUpdating(true);

		try {
			await updateExpenseStatus(actionData.id, actionData.targetStatus, notes);
			setActionData(null);
		} finally {
			setIsUpdating(false);
		}
	};

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return (
		<DashboardLayout user={user} onLogout={logout}>
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
				onSuccess={fetchExpenses}
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
