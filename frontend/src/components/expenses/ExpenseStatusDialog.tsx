import React, {useEffect, useState} from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';
import {Button} from '../ui/button';
import {Label} from '../ui/label';
import {Textarea} from '../ui/textarea';

export type StatusAction = 'APPROVED' | 'REJECTED' | 'PAID';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: StatusAction | null;
	onConfirm: (notes: string) => void;
	loading?: boolean;
};

const actionCopy: Record<StatusAction, {title: string; desc: string; cta: string}> = {
	APPROVED: {
		title: 'Setujui Pengajuan',
		desc: 'Pengajuan akan ditandai sebagai APPROVED.',
		cta: 'Approve',
	},
	REJECTED: {
		title: 'Tolak Pengajuan',
		desc: 'Pengajuan akan ditandai sebagai REJECTED.',
		cta: 'Reject',
	},
	PAID: {
		title: 'Tandai Sudah Dibayar',
		desc: 'Pengajuan akan ditandai sebagai PAID.',
		cta: 'Mark as Paid',
	},
};

export const ExpenseStatusDialog: React.FC<Props> = ({
	open,
	onOpenChange,
	action,
	onConfirm,
	loading,
}) => {
	const [notes, setNotes] = useState('');

	useEffect(() => {
		if (open) setNotes('');
	}, [open]);

	if (!action) return null;
	const copy = actionCopy[action];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{copy.title}</DialogTitle>
					<DialogDescription>{copy.desc}</DialogDescription>
				</DialogHeader>

				<div className="space-y-2 py-2">
					<Label htmlFor="notes">Catatan (opsional)</Label>
					<Textarea
						id="notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Tambahkan catatan untuk pengaju..."
						rows={3}
					/>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
						Batal
					</Button>
					<Button onClick={() => onConfirm(notes)} disabled={loading}>
						{loading ? 'Memproses...' : copy.cta}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
