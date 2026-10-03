import React, {useState} from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '../ui/dialog';
import {Button} from '../ui/button';
import {Label} from '../ui/label';
import {Textarea} from '../ui/textarea';

interface StatusUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (notes: string) => void;
	actionType: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | null;
	isLoading: boolean;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	actionType,
	isLoading,
}) => {
	const [notes, setNotes] = useState('');

	if (!isOpen || !actionType) return null;

	const config = {
		SUBMITTED: {
			title: 'Kirim Pengajuan',
			desc: 'Apakah Anda yakin ingin mengirim pengajuan ini? Data yang sudah dikirim tidak bisa diedit kembali.',
			btnText: 'Ya, Kirim',
			btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
			showInput: false,
		},
		APPROVED: {
			title: 'Setujui Pengajuan',
			desc: 'Tambahkan pesan persetujuan (opsional).',
			btnText: 'Setujui',
			btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
			showInput: true,
		},
		REJECTED: {
			title: 'Tolak Pengajuan',
			desc: 'Berikan alasan penolakan agar pemohon dapat memperbaikinya.',
			btnText: 'Tolak',
			btnClass: 'bg-red-600 hover:bg-red-700 text-white',
			showInput: true,
		},
		PAID: {
			title: 'Cairkan Dana',
			desc: 'Masukkan nomor referensi transfer atau bukti bayar.',
			btnText: 'Proses Pencairan',
			btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
			showInput: true,
		},
	};

	const currentConfig = config[actionType];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onConfirm(notes);
		setNotes('');
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !isLoading) {
					setNotes('');
					onClose();
				}
			}}>
			<DialogContent className="sm:max-w-106.25 bg-white">
				<DialogHeader>
					<DialogTitle>{currentConfig.title}</DialogTitle>
					<DialogDescription>{currentConfig.desc}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					{currentConfig.showInput && (
						<div className="space-y-2">
							<Label htmlFor="notes">Catatan</Label>
							<Textarea
								id="notes"
								placeholder="Ketik catatan di sini..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="resize-none"
								rows={4}
								required={actionType === 'REJECTED'}
							/>
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
							Batal
						</Button>
						<Button type="submit" className={currentConfig.btnClass} disabled={isLoading}>
							{isLoading ? 'Memproses...' : currentConfig.btnText}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
