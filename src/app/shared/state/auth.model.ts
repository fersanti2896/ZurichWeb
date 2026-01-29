
export interface AuthUser {
    userId: number;
    email: string;
    fullName: string;
    roleId: number;
    roleDescription: string;
    permissions: string[];
    token: string;
    refreshToken: string;
}

export interface AuthStateModel {
    token: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
}
