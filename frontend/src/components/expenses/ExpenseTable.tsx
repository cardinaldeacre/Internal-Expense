import React from 'react';
import {Button} from '../ui/button';

interface ExpenseTableProps {
	expenses: any[];
	loading: boolean;
	userRole: string;
	onUpdateStatus: (id: string, status: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
	expenses,
	loading,
	userRole,
	onUpdateStatus,
}) => {
	if (loading) {
		return <div className="text-center py-12 text-zinc-400">Loading data...</div>;
	}

	if (expenses.length === 0) {
		return <div className="text-center py-12 text-zinc-400">Tidak ada data expense ditemukan.</div>;
	}

	return (
		<div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
			<table className="w-full text-left border-collapse">
				<thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
					<tr>
						<th className="p-4">Requester</th>
						<th className="p-4">Judul & Deskripsi</th>
						<th className="p-4">Amount</th>
						<th className="p-4">Status</th>
						<th className="p-4">Receipt</th>
						<th className="p-4 text-center">Aksi</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-zinc-100 text-sm">
					{expenses.map((item) => (
						<tr key={item.ID} className="hover:bg-zinc-50/50 transition">
							<td className="p-4 font-medium text-zinc-900">
								{item.User?.Name}
								<span className="block text-xs text-zinc-400">{item.User?.Email}</span>
							</td>
							<td className="p-4">
								<p className="font-semibold text-zinc-800">{item.Title}</p>
								<p className="text-xs text-zinc-500">{item.Description}</p>
								{item.Notes && <p className="text-xs text-red-500 mt-1">Catatan: {item.Notes}</p>}
							</td>
							<td className="p-4 font-semibold text-zinc-700">Rp {item.amount.toLocaleString()}</td>
							<td className="p-4">
								<span
									className={`px-2.5 py-1 rounded-full text-xs font-bold ${
										item.Status === 'APPROVED'
											? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
											: item.Status === 'REJECTED'
												? 'bg-red-50 text-red-600 border border-red-200'
												: item.Status === 'PAID'
													? 'bg-blue-50 text-blue-600 border border-blue-200'
													: item.Status === 'SUBMITTED'
														? 'bg-amber-50 text-amber-600 border border-amber-200'
														: 'bg-zinc-100 text-zinc-600'
									}`}>
									{item.Status}
								</span>
							</td>
							<td className="p-4">
								{item.ReceiptURL ? (
									<a
										href={item.ReceiptURL}
										target="_blank"
										rel="noreferrer"
										className="text-blue-600 hover:underline text-xs font-medium">
										Lihat File
									</a>
								) : (
									<span className="text-xs text-zinc-400">Tidak ada</span>
								)}
							</td>
							<td className="p-4 text-center space-x-2">
								{userRole === 'MANAGER' && item.Status === 'SUBMITTED' && (
									<>
										<Button
											size="sm"
											onClick={() => onUpdateStatus(item.ID, 'APPROVED')}
											className="bg-emerald-600 hover:bg-emerald-500 text-white">
											Approve
										</Button>
										<Button
											size="sm"
											onClick={() => onUpdateStatus(item.ID, 'REJECTED')}
											className="bg-red-600 hover:bg-red-500 text-white">
											Reject
										</Button>
									</>
								)}
								{userRole === 'FINANCE' && item.Status === 'APPROVED' && (
									<Button
										size="sm"
										onClick={() => onUpdateStatus(item.ID, 'PAID')}
										className="bg-blue-600 hover:bg-blue-500 text-white">
										Mark Paid
									</Button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
