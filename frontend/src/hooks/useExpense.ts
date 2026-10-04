import api from "@/services/api";
import type { Expense, ExpenseStatus } from "@/types/expense";
import React, { useCallback } from "react";
import { toast } from "sonner";

export const useExpense = () => {
    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchExpenses = useCallback(async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
        setLoading(true);
        try {
            const response = await api.get('/expenses', { params });
            const data = response.data.data?.items || response.data.data || [];
            setExpenses(data);
        } catch (error) {
            toast.error('Gagal memuat data pengeluaran.');
        } finally {
            setLoading(false);
        }

    }, []);

    const createExpense = useCallback(async (expenseData: FormData) => {
        try {
            const response = await api.post('/expenses', expenseData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setExpenses(prev => [response.data, ...prev]);
            toast.success('Pengajuan berhasil dibuat!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal membuat pengajuan.');
        }
    }, []);

    const updateExpenseStatus = async (id: string, status: ExpenseStatus, notes: string) => {
        const request = api.patch(`/expenses/${id}/status`, { status, notes });

        toast.promise(request, {
            loading: 'Memproses status...',
            success: () => {
                fetchExpenses();
                return `Status berhasil diubah menjadi ${status}`;
            },
            error: (err) => err.response?.data?.message || 'Gagal mengubah status'
        });

        return request;
    };

    return { expenses, loading, fetchExpenses, createExpense, updateExpenseStatus };
};