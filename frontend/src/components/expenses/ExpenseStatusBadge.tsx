import React from 'react';
import {Badge} from '../ui/badge';

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

const statusStyles: Record<ExpenseStatus, string> = {
	DRAFT: 'bg-zinc-100 text-zinc-700 border-zinc-200',
	SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	APPROVED: 'bg-green-100 text-green-800 border-green-200',
	REJECTED: 'bg-red-100 text-red-800 border-red-200',
	PAID: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const ExpenseStatusBadge: React.FC<{status: string}> = ({status}) => {
	const key = (status as ExpenseStatus) ?? 'DRAFT';
	const cls = statusStyles[key] ?? statusStyles.DRAFT;
	return (
		<Badge variant="outline" className={`${cls} font-semibold`}>
			{status}
		</Badge>
	);
};
