import type { User } from './auth';

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface Expense {
    id: string;
    user_id: string;
    title: string;
    description: string;
    amount: number;
    receipt_url: string;
    status: ExpenseStatus;
    notes: string;
    created_at: string;
    updated_at: string;

    user?: User;
}

export interface ExpenseListResponse {
    data: Expense[];
    total: number;
    page: number;
    limit: number;
}