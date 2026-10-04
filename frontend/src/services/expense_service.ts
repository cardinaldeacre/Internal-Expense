import api from './api';

export const getExpenses = async () => {
    const response = await api.get('/expenses');

    return response.data;
};

export const createExpense = async (data: FormData) => {
    const response = await api.post('/expenses', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const updateExpenseStatus = async (
    expenseId: string,
    status: string
) => {
    const response = await api.patch(
        `/expenses/${expenseId}/status`,
        { status }
    );

    return response.data;
};

export const getReceiptImage = async (
    expenseId: string
): Promise<Blob> => {
    const response = await api.get(
        `/expenses/${expenseId}/receipt`,
        {
            responseType: 'blob',
        }
    );

    return response.data;
};