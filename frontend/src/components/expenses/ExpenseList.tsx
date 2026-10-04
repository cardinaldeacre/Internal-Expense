import {useEffect, useState} from 'react';
import api from '../../services/api';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../ui/table';
import {Alert, AlertDescription} from '../ui/alert';
import {ExpenseStatusBadge} from './ExpenseStatusBadge';
import {ExpenseRowActions} from './ExpenseRowActions';
import {ExpenseStatusDialog} from './ExpenseStatusDialog';
import type {Expense, ExpenseStatus} from '@/types/expense';

export default function ExpenseList({refreshKey = 0}: {refreshKey?: number}) {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogAction, setDialogAction] = useState<ExpenseStatus | null>(null);
	const [dialogTargetId, setDialogTargetId] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const user = JSON.parse(localStorage.getItem('user') || '{}');

	const fetchExpenses = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await api.get('/expenses');
			setExpenses(res.data.data || []);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Gagal memuat data pengeluaran.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExpenses();
	}, [refreshKey]);

	const openDialog = (id: string, action: ExpenseStatus) => {
		setDialogTargetId(id);
		setDialogAction(action);
		setDialogOpen(true);
	};

	const handleConfirm = async (notes: string) => {
		if (!dialogTargetId || !dialogAction) return;
		setSubmitting(true);
		try {
			await api.patch(`/expenses/${dialogTargetId}/status`, {
				status: dialogAction,
				notes,
			});
			setDialogOpen(false);
			await fetchExpenses();
		} catch (err: any) {
			setError(err.response?.data?.message || 'Gagal mengubah status.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Card className="border-zinc-200 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg font-semibold">Daftar Pengeluaran</CardTitle>
					<CardDescription>Pantau dan kelola pengajuan pengeluaran.</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className="overflow-x-auto rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Judul</TableHead>
									<TableHead>Nominal</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Struk</TableHead>
									<TableHead className="text-right">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading && (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-sm text-zinc-500 py-6">
											Memuat data...
										</TableCell>
									</TableRow>
								)}

								{!loading && expenses.length === 0 && (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-sm text-zinc-500 py-6">
											Belum ada pengajuan.
										</TableCell>
									</TableRow>
								)}

								{!loading &&
									expenses.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="font-medium">{item.title}</TableCell>
											<TableCell>Rp {Number(item.amount).toLocaleString('id-ID')}</TableCell>
											<TableCell>
												<ExpenseStatusBadge status={item.status} />
											</TableCell>
											<TableCell>
												{item.receipt_url ? (
													<a
														href={item.receipt_url}
														target="_blank"
														rel="noreferrer"
														className="text-blue-600 underline text-sm">
														Lihat File
													</a>
												) : (
													<span className="text-xs text-zinc-400">—</span>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end">
													<ExpenseRowActions
														status={item.status}
														role={user.role}
														onAction={(action) => openDialog(item.id, action)}
													/>
												</div>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<ExpenseStatusDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				action={dialogAction}
				onConfirm={handleConfirm}
				loading={submitting}
			/>
		</>
	);
}
