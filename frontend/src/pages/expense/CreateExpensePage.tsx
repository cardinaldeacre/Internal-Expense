import React, {useRef} from 'react';
import {PageLayout} from '@/components/layout/PageLayout';
import {CreateExpenseForm} from '@/components/expenses/CreateExpenseForm';
import {ExpenseList} from '@/components/expenses/ExpenseList';

export const CreateExpensePage: React.FC = () => {
	const listRef = useRef<HTMLDivElement>(null);
	const [refreshKey, setRefreshKey] = React.useState(0);

	return (
		<PageLayout
			title="Pengajuan Pengeluaran"
			description="Buat dan pantau pengajuan pengeluaran internal."
			maxWidth="lg">
			<div className="grid gap-6">
				<CreateExpenseForm onSuccess={() => setRefreshKey((k) => k + 1)} />
				<div ref={listRef}>
					<ExpenseList key={refreshKey} />
				</div>
			</div>
		</PageLayout>
	);
};
