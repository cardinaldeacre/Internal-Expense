import React from 'react';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';

interface Expense {
	id: string;
	title: string;
	amount: number;
	status: string;
	user?: {name: string};
	created_at: string;
}

interface ExpenseTableProps {
	expenses: Expense[];
	loading: boolean;
	userRole: string;
	onUpdateStatus: (id: string, newStatus: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
	expenses,
	loading,
	userRole,
	onUpdateStatus,
}) => {
	if (loading) {
		return <div className="p-8 text-center text-zinc-500">Memuat data pengeluaran...</div>;
	}

	if (!expenses.length) {
		return <div className="p-8 text-center text-zinc-500">Tidak ada data yang ditemukan.</div>;
	}

	return (
		<div className="w-full overflow-auto">
			<table className="w-full text-sm text-left">
				<thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200">
					<tr>
						<th className="px-6 py-4 font-medium">Tanggal</th>
						<th className="px-6 py-4 font-medium">Judul & Pemohon</th>
						<th className="px-6 py-4 font-medium">Jumlah</th>
						<th className="px-6 py-4 font-medium">Status</th>
						<th className="px-6 py-4 font-medium text-right">Aksi</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-zinc-200">
					{expenses.map((item) => (
						<tr key={item.id} className="hover:bg-zinc-50/50 transition-colors bg-white">
							<td className="px-6 py-4 whitespace-nowrap text-zinc-600">
								{new Date(item.created_at).toLocaleDateString('id-ID')}
							</td>
							<td className="px-6 py-4">
								<p className="font-medium text-zinc-900">{item.title}</p>
								<p className="text-xs text-zinc-500">{item.user?.name || 'Staff'}</p>
							</td>
							<td className="px-6 py-4 font-medium text-zinc-900">
								Rp {(item.amount || 0).toLocaleString('id-ID')}
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<Badge
									variant={
										item.status === 'APPROVED'
											? 'default'
											: item.status === 'REJECTED'
												? 'destructive'
												: item.status === 'PAID'
													? 'secondary'
													: 'outline'
									}>
									{item.status}
								</Badge>
							</td>
							<td className="px-6 py-4 flex items-center justify-end gap-2">
								{userRole === 'STAFF' && item.status === 'DRAFT' && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => onUpdateStatus(item.id, 'SUBMITTED')}>
										Kirim Pengajuan
									</Button>
								)}

								{userRole === 'MANAGER' && item.status === 'SUBMITTED' && (
									<>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => onUpdateStatus(item.id, 'REJECTED')}>
											Tolak
										</Button>
										<Button
											className="bg-blue-600 hover:bg-blue-700 text-white"
											size="sm"
											onClick={() => onUpdateStatus(item.id, 'APPROVED')}>
											Setujui
										</Button>
									</>
								)}

								{userRole === 'FINANCE' && item.status === 'APPROVED' && (
									<Button
										className="bg-emerald-600 hover:bg-emerald-700 text-white"
										size="sm"
										onClick={() => onUpdateStatus(item.id, 'PAID')}>
										Cairkan Dana
									</Button>
								)}

								<Button variant="outline" size="sm">
									Detail
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
