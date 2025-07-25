export interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: "STUDENT" | "TEACHER";
    lastLogin: string;
    dateJoined: string;
}

export interface StudentProfile {
    user: User;
    totalXp: number;
    availableXp: number;
}

export interface StoreItem {
    id: number;
    name: string;
    description: string;
    xpCost: number;
    imageUrl: string;
    stockQuantity: number;
    isActive: boolean;
    createdAt: string;
}

export interface Transaction {
    id: number;
    student: StudentProfile;
    item: StoreItem;
    xpCostAtPurchase: number;
    timestamp: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        nextPage: string | null;
        previousPage: string | null;
        count: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface School {
    id: number;
    name: string;
    code: string;
}

export interface MySchoolResponse {
    school: School | null;
}
