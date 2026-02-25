export interface User {
    id: number;
    username: string;
    email: string
}

export interface AuthResponse {
    message?: string;
    accessToken: string;
    user: User
}

export interface OutletContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export interface Todo {
    id: number;
    userId: number;
    title: string;
    check: boolean
}