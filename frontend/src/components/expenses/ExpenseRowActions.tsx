import React from 'react';
import {Button} from '../ui/button';
import type {ExpenseStatus} from '@/types/expense';

type Props = {
	status: string;
	role?: string;
	onAction: (action: ExpenseStatus) => void;
};

export const ExpenseRowActions: React.FC<Props> = ({status, role, onAction}) => {
	const canManagerAct = role === 'MANAGER' && status === 'SUBMITTED';
	const canFinanceAct = role === 'FINANCE' && status === 'APPROVED';

	if (!canManagerAct && !canFinanceAct) {
		return <span className="text-xs text-zinc-400">—</span>;
	}

	return (
		<div className="flex gap-2">
			{canManagerAct && (
				<>
					<Button
						size="sm"
						className="bg-green-600 hover:bg-green-500 text-white"
						onClick={() => onAction('APPROVED')}>
						Approve
					</Button>
					<Button size="sm" variant="destructive" onClick={() => onAction('REJECTED')}>
						Reject
					</Button>
				</>
			)}
			{canFinanceAct && (
				<Button
					size="sm"
					className="bg-blue-600 hover:bg-blue-500 text-white"
					onClick={() => onAction('PAID')}>
					Mark as Paid
				</Button>
			)}
		</div>
	);
};
