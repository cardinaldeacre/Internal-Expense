import {useEffect, useState} from 'react';
import {getReceiptImage} from '@/services/expense_service';

interface ReceiptImageProps {
	expenseId: string;
}

const ReceiptImage = ({expenseId}: ReceiptImageProps) => {
	const [imageUrl, setImageUrl] = useState<string>('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let objectUrl: string | null = null;

		const loadReceipt = async () => {
			try {
				setLoading(true);

				const blob = await getReceiptImage(expenseId);

				objectUrl = URL.createObjectURL(blob);
				setImageUrl(objectUrl);
			} catch (error) {
				console.error('Gagal memuat receipt:', error);
				setImageUrl('');
			} finally {
				setLoading(false);
			}
		};

		loadReceipt();

		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [expenseId]);

	if (loading) {
		return <div className="py-8 text-center text-sm text-zinc-500">Memuat bukti struk...</div>;
	}

	if (!imageUrl) {
		return <div className="py-8 text-center text-sm text-zinc-500">Gambar tidak ditemukan.</div>;
	}

	return (
		<div className="rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 flex justify-center p-2">
			<img
				src={imageUrl}
				alt="Bukti Struk"
				className="max-h-75 object-contain rounded-md shadow-sm"
			/>
		</div>
	);
};

export default ReceiptImage;
