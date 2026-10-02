import React, {useEffect, useState} from 'react';
import api from '../../services/api';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';

export type Expense = {
	id: number;
	title: string;
	amount: number;
	is_submitted: boolean;
	created_at: string;
};

export const ExpenseList: React.FC<{refreshKey?: number}> = ({refreshKey = 0}) => {
	const [items, setItems] = useState<Expense[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await api.get('/expenses');
			setItems(res.data?.data ?? res.data ?? []);
		} catch {
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [refreshKey]);

	return (
		<Card className="border-zinc-200 shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Daftar Pengajuan</CardTitle>
			</CardHeader>
			<CardContent>
				{loading && <p className="text-sm text-zinc-500">Memuat data...</p>}
				{!loading && items.length === 0 && (
					<p className="text-sm text-zinc-500">Belum ada pengajuan.</p>
				)}
				<ul className="divide-y">
					{items.map((item) => (
						<li key={item.id} className="flex items-center justify-between py-3">
							<div>
								<p className="font-medium text-zinc-900">{item.title}</p>
								<p className="text-xs text-zinc-500">
									{new Date(item.created_at).toLocaleDateString('id-ID')}
								</p>
							</div>
							<p className="font-semibold text-zinc-900">
								Rp {Number(item.amount).toLocaleString('id-ID')}
							</p>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
};
