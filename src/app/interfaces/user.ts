export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    role: 'admin' | 'user';
    createdAt?: string;
    updatedAt?: string;
}