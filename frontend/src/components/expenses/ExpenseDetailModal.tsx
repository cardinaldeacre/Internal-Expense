import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '../ui/dialog';
import {Badge} from '../ui/badge';
import {Separator} from '../ui/separator';
import ReceiptImage from './ReceiptImage';
import type {Expense} from '@/types/expense';

interface ExpenseDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	expense: Expense | null;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
	isOpen,
	onClose,
	expense,
}) => {
	if (!expense) return null;

	const formattedDate = new Date(expense.created_at).toLocaleDateString('id-ID', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-150 bg-white">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-zinc-900">Detail Pengajuan</DialogTitle>
					<DialogDescription className="text-zinc-500">
						Informasi lengkap mengenai pengeluaran operasional.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="font-semibold text-lg text-zinc-900">{expense.title}</h3>
							<p className="text-sm text-zinc-500">
								Diajukan oleh:{' '}
								<span className="font-medium text-zinc-700">{expense.user?.name || 'Staff'}</span>
							</p>
							<p className="text-sm text-zinc-500">{formattedDate}</p>
						</div>
						<div className="text-right">
							<p className="text-2xl font-bold text-zinc-900">
								Rp {(expense.amount || 0).toLocaleString('id-ID')}
							</p>
							<div className="mt-2">
								<Badge
									variant={
										expense.status === 'APPROVED'
											? 'default'
											: expense.status === 'REJECTED'
												? 'destructive'
												: expense.status === 'PAID'
													? 'secondary'
													: 'outline'
									}>
									{expense.status}
								</Badge>
							</div>
						</div>
					</div>

					<Separator />

					<div className="grid gap-4">
						<div>
							<h4 className="text-sm font-semibold text-zinc-900 mb-1">Deskripsi Lengkap</h4>
							<p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 whitespace-pre-wrap">
								{expense.description || 'Tidak ada deskripsi.'}
							</p>
						</div>

						{expense.notes && (
							<div>
								<h4 className="text-sm font-semibold text-amber-900 mb-1">Catatan / Alasan</h4>
								<p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100">
									{expense.notes}
								</p>
							</div>
						)}
					</div>

					<div>
						<h4 className="text-sm font-semibold text-zinc-900 mb-2">Bukti Transaksi (Struk)</h4>
						{expense.receipt_url ? (
							<ReceiptImage expenseId={expense.id} />
						) : (
							<div className="p-4 bg-zinc-50 border border-zinc-200 border-dashed rounded-lg text-center">
								<p className="text-sm text-zinc-500">Tidak ada bukti struk yang dilampirkan.</p>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
