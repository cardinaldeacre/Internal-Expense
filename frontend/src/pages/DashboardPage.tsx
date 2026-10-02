import React, {useEffect, useState} from 'react';
import api from '../services/api';
import {useNavigate} from 'react-router-dom';
import {Navbar} from '../components/layout/Navbar';
import {ExpenseTable} from '../components/dashboard/ExpenseTable';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';

export const DashboardPage: React.FC = () => {
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [page, setPage] = useState(1);

	// Form Modal State
	const [showModal, setShowModal] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [amount, setAmount] = useState('');
	const [receiptFile, setReceiptFile] = useState<File | null>(null);

	const user = JSON.parse(localStorage.getItem('user') || '{}');
	const navigate = useNavigate();

	const fetchExpenses = async () => {
		setLoading(true);
		try {
			const res = await api.get(
				`/expenses?page=${page}&limit=5&search=${search}&status=${statusFilter}`
			);
			setExpenses(res.data.data.items || []);
		} catch (err) {
			console.error('Failed to fetch expenses', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExpenses();
	}, [page, search, statusFilter]);

	const handleLogout = async () => {
		await api.post('/auth/logout');
		localStorage.removeItem('user');
		navigate('/login');
	};

	const handleCreateExpense = async (e: React.FormEvent, isSubmitted: boolean) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('amount', amount);
		formData.append('is_submitted', isSubmitted ? 'true' : 'false');
		if (receiptFile) formData.append('receipt', receiptFile);

		try {
			await api.post('/expenses', formData, {headers: {'Content-Type': 'multipart/form-data'}});
			setShowModal(false);
			setTitle('');
			setDescription('');
			setAmount('');
			setReceiptFile(null);
			fetchExpenses();
		} catch (err: any) {
			alert(err.response?.data?.message || 'Gagal membuat pengajuan');
		}
	};

	const handleUpdateStatus = async (id: string, newStatus: string) => {
		const notes = prompt('Masukkan catatan / alasan (opsional):') || '';
		try {
			await api.patch(`/expenses/${id}/status`, {status: newStatus, notes});
			fetchExpenses();
		} catch (err: any) {
			alert(err.response?.data?.message || 'Gagal mengubah status');
		}
	};

	return (
		<div className="min-h-screen bg-zinc-50 pb-12">
			<Navbar user={user} onLogout={handleLogout} />

			<main className="max-w-7xl mx-auto px-6 mt-8">
				{/* Filter & Action Bar */}
				<div className="flex justify-between items-center mb-6">
					<div className="flex gap-3">
						<Input
							type="text"
							placeholder="Cari judul / deskripsi..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-64 bg-white"
						/>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
							<option value="">Semua Status</option>
							<option value="DRAFT">Draft</option>
							<option value="SUBMITTED">Submitted</option>
							<option value="APPROVED">Approved</option>
							<option value="REJECTED">Rejected</option>
							<option value="PAID">Paid</option>
						</select>
					</div>

					{user.role === 'STAFF' && (
						<Button
							onClick={() => setShowModal(true)}
							className="bg-blue-600 hover:bg-blue-500 text-white">
							+ Ajukan Expense
						</Button>
					)}
				</div>

				{/* Tabel Data */}
				<ExpenseTable
					expenses={expenses}
					loading={loading}
					userRole={user.role}
					onUpdateStatus={handleUpdateStatus}
				/>

				<div className="mt-6 flex items-center justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => setPage((prev) => Math.max(1, prev - 1))}
						disabled={page === 1 || loading}
						className="disabled:opacity-50">
						Sebelumnya
					</Button>
					<span className="text-sm text-zinc-600">Halaman {page}</span>
					<Button
						type="button"
						variant="outline"
						onClick={() => setPage((prev) => prev + 1)}
						disabled={loading || expenses.length < 5}
						className="disabled:opacity-50">
						Berikutnya
					</Button>
				</div>
			</main>

			{/* Modal Sederhana untuk Create */}
			{showModal && (
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
								<Button type="button" variant="outline" onClick={() => setShowModal(false)}>
									Batal
								</Button>
								<Button
									type="button"
									variant="secondary"
									onClick={(e) => handleCreateExpense(e, false)}>
									Simpan Draft
								</Button>
								<Button
									type="button"
									onClick={(e) => handleCreateExpense(e, true)}
									className="bg-blue-600 hover:bg-blue-500 text-white">
									Submit
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};
