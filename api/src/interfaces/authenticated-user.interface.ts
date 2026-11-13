export interface AuthenticatedUser {
    id: string;
    name: string;
    age: number;
    email: string;
    roles?: Array<{ name: string }>;
}
