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

// ============= CAR TYPES =============

export interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    color: string;
    url: string;
    image_url?: string;
    mileage: number;
    transmission: string;
    fuel_type: string;
    body_type: string;
    location: string;
    description: string;
}

export interface CarsResponse {
    cars: Car[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

export interface CarFilters {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    color?: string;
    transmission?: string;
    fuel_type?: string;
}

export interface CarStats {
    brands: string[];
    models: { [brand: string]: string[] };
    colors: string[];
    transmissions: string[];
    fuelTypes: string[];
    priceRange: { min: number; max: number };
    yearRange: { min: number; max: number };
}