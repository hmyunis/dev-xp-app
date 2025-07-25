import axios from "axios";
import {
    AuthTokens,
    ApiResponse,
    PaginatedResponse,
    User,
    StudentProfile,
    StoreItem,
    Transaction,
    School,
    MySchoolResponse,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data.data;
                    localStorage.setItem("accessToken", access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

export const authApi = {
    login: (username: string, password: string) =>
        apiClient.post<ApiResponse<AuthTokens>>("/auth/token/", { username, password }),

    refreshToken: (refresh: string) =>
        apiClient.post<ApiResponse<{ access: string }>>("/auth/token/refresh/", { refresh }),

    changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) =>
        apiClient.post<ApiResponse<{ message: string }>>("/auth/change-password/", {
            oldPassword,
            newPassword,
            confirmPassword,
        }),
};

export const userApi = {
    getCurrentUser: () => apiClient.get<ApiResponse<User>>("/users/me/"),

    updateCurrentUser: (data: Partial<User>) =>
        apiClient.patch<ApiResponse<User>>("/users/me/", data),

    getAllUsers: (params?: { page?: number; pageSize?: number; search?: string }) =>
        apiClient.get<ApiResponse<PaginatedResponse<User>>>("/users/", { params }),

    createUser: (userData: Partial<User> & { password: string }) =>
        apiClient.post<ApiResponse<User>>("/users/", userData),

    getUser: (id: number) => apiClient.get<ApiResponse<User>>(`/users/${id}/`),

    updateUser: (id: number, data: Partial<User>) =>
        apiClient.patch<ApiResponse<User>>(`/users/${id}/`, data),

    deleteUser: (id: number) => apiClient.delete(`/users/${id}/`),

    getMySchool: () => apiClient.get<ApiResponse<MySchoolResponse>>("/users/my-school/"),
};

export const studentApi = {
    getLeaderboard: (params?: { page?: number; pageSize?: number }) =>
        apiClient.get<ApiResponse<PaginatedResponse<StudentProfile>>>("/students/leaderboard/", {
            params,
        }),

    getStudentProfiles: (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        ordering?: string;
    }) =>
        apiClient.get<ApiResponse<PaginatedResponse<StudentProfile>>>("/students/profiles/", {
            params,
        }),

    addXpToStudent: (userId: number, xpPoints: number, reason: string) =>
        apiClient.post<ApiResponse<StudentProfile>>(`/students/profiles/${userId}/add-xp/`, {
            xpPoints,
            reason,
        }),
    getXpHistory: (params?: { page?: number; pageSize?: number; search?: string }) =>
        apiClient.get<ApiResponse<PaginatedResponse<any>>>("/students/xp-history/", { params }),
};

export const storeApi = {
    getStoreItems: (params?: { page?: number; pageSize?: number; search?: string }) =>
        apiClient.get<ApiResponse<PaginatedResponse<StoreItem>>>("/store/items/", { params }),

    createStoreItem: (formData: FormData) =>
        apiClient.post<ApiResponse<StoreItem>>("/store/items/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    getStoreItem: (id: number) => apiClient.get<ApiResponse<StoreItem>>(`/store/items/${id}/`),

    updateStoreItem: (id: number, formData: FormData) =>
        apiClient.patch<ApiResponse<StoreItem>>(`/store/items/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    deleteStoreItem: (id: number) => apiClient.delete(`/store/items/${id}/`),

    getTransactions: (params?: {
        page?: number;
        pageSize?: number;
        studentId?: number;
        itemId?: number;
    }) =>
        apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>("/store/transactions/", {
            params,
        }),

    createTransaction: (studentId: number, itemId: number) =>
        apiClient.post<ApiResponse<Transaction>>("/store/transactions/", {
            studentId,
            itemId,
        }),
};

export default apiClient;
