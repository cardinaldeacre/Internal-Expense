import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';

interface StatCardsProps {
	totalExpense: number;
	pendingCount: number;
	approvedCount: number;
	paidTotal: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
	totalExpense,
	pendingCount,
	approvedCount,
	paidTotal,
}) => {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
			<Card className="bg-white border-zinc-200 shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-zinc-500">Total Pengajuan</CardTitle>
					<svg
						className="h-4 w-4 text-zinc-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-zinc-900">
						Rp {totalExpense.toLocaleString('id-ID')}
					</div>
				</CardContent>
			</Card>

			<Card className="bg-white border-zinc-200 shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-amber-600">Menunggu Persetujuan</CardTitle>
					<svg
						className="h-4 w-4 text-amber-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-zinc-900">
						{pendingCount} <span className="text-sm font-normal text-zinc-500">dokumen</span>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-white border-zinc-200 shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-blue-600">Siap Dicairkan</CardTitle>
					<svg
						className="h-4 w-4 text-blue-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-zinc-900">
						{approvedCount} <span className="text-sm font-normal text-zinc-500">dokumen</span>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-white border-zinc-200 shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-emerald-600">Dana Dicairkan</CardTitle>
					<svg
						className="h-4 w-4 text-emerald-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
					</svg>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-zinc-900">
						Rp {paidTotal.toLocaleString('id-ID')}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
