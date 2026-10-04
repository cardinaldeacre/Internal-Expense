export type UserRole = 'ADMIN' | 'STAFF' | 'MANAGER' | 'FINANCE';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    created_at?: string;
    updated_at?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token?: string;
}