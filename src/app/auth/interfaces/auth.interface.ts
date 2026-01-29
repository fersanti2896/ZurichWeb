export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LoginDTO {
    userId: number;
    email: string;
    token: string;
    refreshToken: string;
    fullName: string;
    roleId: number;
    roleDescription: string;
}

export interface ApiResponse<T> {
    result: T | null;
    error: any;
}
