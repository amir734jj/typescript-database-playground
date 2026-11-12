export interface AuthenticatedUser {
    id: number;
    name: string;
    age: number;
    email: string;
    roles?: Array<{ name: string }>;
}
