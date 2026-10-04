import React, {useEffect, useState} from 'react';
import {DashboardLayout} from '../../components/layout/DashboardLayout';
import {PageLayout} from '../../components/layout/PageLayout';
import {ExpenseTable} from '../../components/expenses/ExpenseTable';
import {Input} from '../../components/ui/input';
import {StatusUpdateModal} from '@/components/expenses/StatusUpdateModal';
import {useAuth} from '@/hooks/useAuth';
import type {ExpenseStatus} from '@/types/expense';
import {useExpense} from '@/hooks/useExpense';
import { Navigate } from 'react-router-dom';

export const ApprovalsPage: React.FC = () => {
	const {expenses, loading, fetchExpenses, updateExpenseStatus} = useExpense();
	const {user, logout} = useAuth();

	const [page] = useState(1);
	const [search, setSearch] = useState('');
	const [actionData, setActionData] = useState<{id: string; targetStatus: ExpenseStatus} | null>(
		null
	);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		fetchExpenses({page, limit: 10, search, status: 'SUBMITTED'});
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
		if (!user) {
			return <Navigate to="/login" replace />;
		}

	return (
		<DashboardLayout user={user} onLogout={logout}>
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
						onUpdateStatus={handleTriggerAction}
					/>
				</div>
			</PageLayout>

			<StatusUpdateModal
				isOpen={!!actionData}
				actionType={actionData?.targetStatus || 'APPROVED'}
				onClose={() => setActionData(null)}
				onConfirm={executeUpdateStatus}
				isLoading={isUpdating}
			/>
		</DashboardLayout>
	);
};
