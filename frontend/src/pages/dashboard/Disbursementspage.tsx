import React, {useEffect, useState} from 'react';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {PageLayout} from '../../components/layout/PageLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {Input} from '../../components/ui/input';
import {StatusUpdateModal} from '@/components/expenses/StatusUpdateModal';
import {useAuth} from '@/hooks/useAuth';
import {useExpense} from '@/hooks/useExpense';
import type {ExpenseStatus} from '@/types/expense';

export const DisbursementsPage: React.FC = () => {
	const {expenses, loading, fetchExpenses, updateExpenseStatus} = useExpense();
	const {logout} = useAuth();

	const [search, setSearch] = useState('');
	const [page] = useState(1);

	const [actionData, setActionData] = useState<{
		id: string;
		targetStatus: ExpenseStatus;
	} | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const user = JSON.parse(localStorage.getItem('user') || '{}');

	useEffect(() => {
		fetchExpenses({page, limit: 10, search, status: 'APPROVED'});
	}, [page, search, fetchExpenses]);

	const handleTriggerAction = (id: string, newStatus: ExpenseStatus) => {
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

	return (
		<DashboardLayout user={user} onLogout={logout}>
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
						onUpdateStatus={handleTriggerAction}
					/>
				</div>
			</PageLayout>

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
