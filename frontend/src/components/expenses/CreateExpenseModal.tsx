import React, {useState} from 'react';
import api from '../../services/api';
import {Button} from '../ui/button';
import {Input} from '../ui/input';

interface CreateExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [amount, setAmount] = useState('');
	const [receiptFile, setReceiptFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const handleCreateExpense = async (e: React.FormEvent, isSubmitted: boolean) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('amount', amount);
		formData.append('is_submitted', isSubmitted ? 'true' : 'false');
		if (receiptFile) formData.append('receipt', receiptFile);

		try {
			await api.post('/expenses', formData, {headers: {'Content-Type': 'multipart/form-data'}});

			setTitle('');
			setDescription('');
			setAmount('');
			setReceiptFile(null);
			onSuccess();
			onClose();
		} catch (err: any) {
			alert(err.response?.data?.message || 'Gagal membuat pengajuan');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
			<div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-zinc-200">
				<h3 className="text-lg font-bold text-zinc-900 mb-4">Ajukan Expense Baru</h3>
				<form className="space-y-4">
					<Input
						placeholder="Judul Pengajuan"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
					<textarea
						placeholder="Deskripsi detail..."
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					/>
					<Input
						type="number"
						placeholder="Jumlah (Amount)"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
					/>
					<input
						type="file"
						onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
						className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
					/>
					<div className="flex justify-end gap-2 pt-4">
						<Button type="button" variant="outline" onClick={onClose} disabled={loading}>
							Batal
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={(e) => handleCreateExpense(e, false)}
							disabled={loading}>
							Simpan Draft
						</Button>
						<Button
							type="button"
							onClick={(e) => handleCreateExpense(e, true)}
							className="bg-blue-600 hover:bg-blue-500 text-white"
							disabled={loading}>
							Submit
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
