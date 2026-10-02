import React, {useRef, useState} from 'react';
import api from '../../services/api';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {Label} from '../ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Alert, AlertDescription} from '../ui/alert';

type CreateExpenseFormProps = {
	onSuccess?: () => void;
};

export const CreateExpenseForm: React.FC<CreateExpenseFormProps> = ({onSuccess}) => {
	const [title, setTitle] = useState('');
	const [amount, setAmount] = useState('');
	const [receipt, setReceipt] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');
	const [successMsg, setSuccessMsg] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setErrorMsg('');
		setSuccessMsg('');

		const formData = new FormData();
		formData.append('title', title);
		formData.append('amount', amount);
		formData.append('is_submitted', 'true');
		if (receipt) formData.append('receipt', receipt);

		try {
			await api.post('/expenses', formData, {
				headers: {'Content-Type': 'multipart/form-data'},
			});

			setSuccessMsg('Pengajuan berhasil dibuat!');
			setTitle('');
			setAmount('');
			setReceipt(null);
			if (fileInputRef.current) fileInputRef.current.value = '';

			onSuccess?.();
		} catch (err: any) {
			setErrorMsg(err.response?.data?.message || 'Gagal membuat pengajuan.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="border-zinc-200 shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Buat Pengajuan Baru</CardTitle>
				<CardDescription>Lengkapi data pengeluaran di bawah ini.</CardDescription>
			</CardHeader>

			<CardContent>
				{errorMsg && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{errorMsg}</AlertDescription>
					</Alert>
				)}

				{successMsg && (
					<Alert className="mb-4 border-green-500/30 bg-green-500/10 text-green-700">
						<AlertDescription>{successMsg}</AlertDescription>
					</Alert>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Judul Pengeluaran</Label>
						<Input
							id="title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Contoh: Makan siang klien"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="amount">Nominal (Rp)</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
								Rp
							</span>
							<Input
								id="amount"
								type="number"
								min={0}
								step={1000}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0"
								className="pl-9"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="receipt-input">Struk / Bukti (Gambar / PDF)</Label>
						<Input
							id="receipt-input"
							ref={fileInputRef}
							type="file"
							accept="image/*,.pdf"
							onChange={(e) => setReceipt(e.target.files?.[0] || null)}
							className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-200"
						/>
						{receipt && (
							<p className="text-xs text-zinc-500">
								File dipilih: <span className="font-medium">{receipt.name}</span>
							</p>
						)}
					</div>

					<Button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold">
						{loading ? 'Mengirim...' : 'Kirim Pengajuan'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
